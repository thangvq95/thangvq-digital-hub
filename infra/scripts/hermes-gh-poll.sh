#!/usr/bin/env bash
# ~/.hermes/scripts/hermes-gh-poll.sh
# Run via Hermes native cron to poll GitHub for issues/PRs and execute work.
# Requires: gh CLI authenticated (gh auth status), jq, sqlite3.

set -euo pipefail

# Prevent overlapping runs with flock
exec 9>/tmp/hermes-gh-poll.lock
flock -n 9 || { echo "[WARN] Another polling instance is still running. Exiting."; exit 0; }

# Config
REPO_DIR="${BASE_REPO:-/app/repo}"
WORKTREES_DIR="${WORKTREES_DIR:-/app/worktrees}"
DEDUP_DB="${DEDUP_DB:-/app/data/ai-workspace.db}"

mkdir -p "$(dirname "$DEDUP_DB")"
mkdir -p "$WORKTREES_DIR"

# Initialize dedup DB
sqlite3 "$DEDUP_DB" "CREATE TABLE IF NOT EXISTS seen_events (event_id TEXT PRIMARY KEY, created_at INTEGER NOT NULL);"

seen_before() {
    local event_id="$1"
    
    # Sanitize inputs to prevent SQL injection or breakage
    local safe_id
    safe_id=$(printf '%s' "$event_id" | sed "s/'/''/g")
    
    local count
    count=$(sqlite3 "$DEDUP_DB" "SELECT COUNT(*) FROM seen_events WHERE event_id = '$safe_id';")
    [ "$count" -gt 0 ]
}

mark_seen() {
    local event_id="$1"
    local safe_id
    safe_id=$(printf '%s' "$event_id" | sed "s/'/''/g")
    
    sqlite3 "$DEDUP_DB" "INSERT OR IGNORE INTO seen_events (event_id, created_at) VALUES ('$safe_id', $(date +%s));"
}

cd "$REPO_DIR"
git fetch origin

headless_prompt=" (CRITICAL: You are running in a headless automated environment. Do NOT use ask_user tools. Do NOT ask for clarification. Make safe assumptions and proceed. Ensure all CLI commands use non-interactive flags like --yes or --fill. If you must, guess the best approach and create a PR.)"

echo "[INFO] Polling GitHub for open issues..."
gh issue list --state open --json number,labels,updatedAt --limit 20 | jq -c '.[]' | while read -r issue; do
    num=$(echo "$issue" | jq -r '.number')
    updated=$(echo "$issue" | jq -r '.updatedAt' | tr -d ':-')
    event_id="issue_${num}_${updated}"
    
    if seen_before "$event_id"; then
        continue
    fi
    
    echo "[INFO] Processing issue #$num"
    
    labels=$(echo "$issue" | jq -r '.labels[].name' | tr '[:upper:]' '[:lower:]')
    
    skill="triage"
    target_desc="FIRST, use the 'gh issue view $num' command to read the issue description. THEN, triage issue #$num.$headless_prompt"
    
    if echo "$labels" | grep -qE "bug|sentry"; then
        skill="diagnose"
        target_desc="FIRST, use the 'gh issue view $num' command to read the issue description. THEN, fix the bug in issue #$num.$headless_prompt"
    elif echo "$labels" | grep -qE "feature|enhancement"; then
        skill="to-prd"
        target_desc="FIRST, use the 'gh issue view $num' command to read the issue description. THEN, implement the feature for issue #$num.$headless_prompt"
    elif echo "$labels" | grep -q "plan"; then
        skill="writing-plans"
        target_desc="FIRST, use the 'gh issue view $num' command to read the issue description. THEN, create a plan for issue #$num.$headless_prompt"
    fi
    
    # Run in worktree
    branch="main"
    safe_ref="main"
    worktree="$WORKTREES_DIR/${safe_ref}_${event_id}"
    
    git worktree add -d --force "$worktree" "origin/$branch" || {
        echo "[ERROR] Failed to create worktree at $worktree for $event_id"
        continue
    }
    
    echo "[INFO] Running hermes with skill: $skill on worktree: $worktree"
    (
        cd "$worktree"
        timeout 45m hermes -s "$skill" -z "$target_desc" || echo "[WARN] Hermes run failed or timed out."
    )
    
    git worktree remove --force "$worktree" || true
    mark_seen "$event_id"
done

echo "[INFO] Polling GitHub for open PRs..."
gh pr list --state open --json number,headRefName,updatedAt --limit 20 | jq -c '.[]' | while read -r pr; do
    num=$(echo "$pr" | jq -r '.number')
    ref=$(echo "$pr" | jq -r '.headRefName')
    updated=$(echo "$pr" | jq -r '.updatedAt' | tr -d ':-')
    event_id="pr_${num}_${updated}"
    
    if seen_before "$event_id"; then
        continue
    fi
    
    echo "[INFO] Processing PR #$num"
    
    skill="gh-fix-ci"
    target_desc="Fix PR $num. FIRST, view the PR details using 'gh pr view $num'. THEN proceed.$headless_prompt"
    
    safe_ref=$(echo "$ref" | sed 's/[^a-zA-Z0-9]/_/g')
    worktree="$WORKTREES_DIR/${safe_ref}_${event_id}"
    
    git fetch origin -- "$ref" || true
    git worktree add -d --force "$worktree" -- "origin/$ref" || {
        echo "[ERROR] Failed to create worktree at $worktree for $event_id"
        continue
    }
    
    echo "[INFO] Running hermes on PR #$num worktree"
    (
        cd "$worktree"
        timeout 45m hermes -s "$skill" -z "$target_desc" || echo "[WARN] Hermes run failed or timed out."
    )
    
    git worktree remove --force "$worktree" || true
    mark_seen "$event_id"
done

# Check if main changed, if so run gitnexus analyze
echo "[INFO] Checking if main branch updated..."
latest_hash=$(git ls-remote origin main | awk '{print $1}')
event_id="commit_${latest_hash}"

if ! seen_before "$event_id"; then
    echo "[INFO] Main branch updated. Running gitnexus analyze..."
    git reset --hard "origin/main"
    gitnexus analyze || true
    mark_seen "$event_id"
fi

echo "[INFO] Polling complete."
