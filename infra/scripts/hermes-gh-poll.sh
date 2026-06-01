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

send_telegram() {
    local message="$1"
    if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "parse_mode=Markdown" \
            --data-urlencode "text=${message}" > /dev/null || true
    fi
}

seen_before() {
    local event_id="$1"
    
    # Sanitize inputs to prevent SQL injection or breakage
    local safe_id
    safe_id=$(echo "$event_id" | sed "s/'/''/g")
    
    local count
    count=$(sqlite3 "$DEDUP_DB" "SELECT COUNT(*) FROM seen_events WHERE event_id = '$safe_id';")
    [ "$count" -gt 0 ]
}

mark_seen() {
    local event_id="$1"
    local safe_id
    safe_id=$(echo "$event_id" | sed "s/'/''/g")
    
    sqlite3 "$DEDUP_DB" "INSERT OR IGNORE INTO seen_events (event_id, created_at) VALUES ('$safe_id', $(date +%s));"
}

cd "$REPO_DIR"
git fetch origin

# Check if main changed, if so run gitnexus analyze first
echo "[INFO] Checking if main branch updated..."
latest_hash=$(git ls-remote origin main | awk '{print $1}')
event_id="commit_${latest_hash}"

if ! seen_before "$event_id"; then
    echo "[INFO] Main branch updated. Running gitnexus analyze..."
    git reset --hard "origin/main"
    gitnexus analyze || true
    mark_seen "$event_id"
fi

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
    send_telegram "🤖 *[Hermes]* Bắt đầu xử lý Issue [#$num](https://github.com/thangvq95/thangvq-digital-hub/issues/$num)
*Skill*: \`$skill\`"

    set +e
    (
        cd "$worktree"
        timeout 45m hermes -s "$skill" -z "$target_desc"
    )
    status=$?
    set -e

    if [ $status -eq 0 ]; then
        # Query the latest open PR to see if one was just created for this issue
        pr_info=$(gh pr list --state open --limit 5 --json number,title,url,headRefName 2>/dev/null | jq -c '.[]' | head -n 1 || true)
        if [ -n "$pr_info" ]; then
            pr_num=$(echo "$pr_info" | jq -r '.number')
            pr_url=$(echo "$pr_info" | jq -r '.url')
            pr_title=$(echo "$pr_info" | jq -r '.title')
            send_telegram "✅ *[Hermes]* Đã xử lý thành công Issue [#$num](https://github.com/thangvq95/thangvq-digital-hub/issues/$num)
*Kết quả*: Đã tạo Pull Request [#$pr_num]($pr_url): \`$pr_title\`
👉 Vui lòng click vào link để review và merge."
        else
            send_telegram "✅ *[Hermes]* Đã hoàn thành xử lý Issue [#$num](https://github.com/thangvq95/thangvq-digital-hub/issues/$num) thành công!"
        fi
    else
        send_telegram "❌ *[Hermes]* Xử lý Issue [#$num](https://github.com/thangvq95/thangvq-digital-hub/issues/$num) THẤT BẠI hoặc bị timeout (status: $status)!"
    fi
    
    git worktree remove --force "$worktree" || true
    mark_seen "$event_id"
done

echo "[INFO] Polling GitHub for open PRs with failing CI..."
gh pr list --state open --json number,headRefName,updatedAt,title,author --limit 20 | jq -c '.[]' | while read -r pr; do
    num=$(echo "$pr" | jq -r '.number')
    ref=$(echo "$pr" | jq -r '.headRefName')
    updated=$(echo "$pr" | jq -r '.updatedAt' | tr -d ':-')
    title=$(echo "$pr" | jq -r '.title')
    author=$(echo "$pr" | jq -r '.author.login')
    event_id="pr_${num}_${updated}"

    if seen_before "$event_id"; then
        continue
    fi

    # --- GUARD: Skip release-please PRs (they are auto-managed) ---
    if echo "$title" | grep -qiE "^chore\(main\): release"; then
        echo "[SKIP] PR #$num is a release-please PR. Skipping."
        mark_seen "$event_id"
        continue
    fi

    # --- GUARD: Skip PRs authored by Hermes itself (prevent infinite loop) ---
    if echo "$author" | grep -qiE "hermes|bot"; then
        echo "[SKIP] PR #$num was authored by bot/Hermes ($author). Skipping to prevent loop."
        mark_seen "$event_id"
        continue
    fi

    # --- GUARD: Only act if CI checks are actually failing ---
    ci_status=$(gh pr view "$num" --json statusCheckRollup --jq '.statusCheckRollup[].conclusion' 2>/dev/null | grep -c "FAILURE" || true)
    if [ "$ci_status" -eq 0 ]; then
        echo "[SKIP] PR #$num has no failing CI checks. Skipping."
        mark_seen "$event_id"
        continue
    fi

    echo "[INFO] Processing PR #$num ($title) — $ci_status failing check(s)"

    skill="pr-review-ci-fix"
    target_desc="PR #$num has failing CI checks. FIRST, run 'gh pr view $num' to read the PR. THEN, fix only the failing CI checks by patching the source code. Do NOT create new branches or new PRs. Push fixes to the existing branch '$ref' directly.$headless_prompt"

    safe_ref=$(echo "$ref" | sed 's/[^a-zA-Z0-9]/_/g')
    worktree="$WORKTREES_DIR/${safe_ref}_${event_id}"

    git fetch origin "$ref" || true
    git worktree add -d --force "$worktree" "origin/$ref" || {
        echo "[ERROR] Failed to create worktree at $worktree for $event_id"
        continue
    }

    echo "[INFO] Running hermes on PR #$num worktree"
    send_telegram "🤖 *[Hermes]* Bắt đầu sửa lỗi CI cho PR [#$num](https://github.com/thangvq95/thangvq-digital-hub/pull/$num)
*Tiêu đề*: \`$title\`"

    set +e
    (
        cd "$worktree"
        timeout 45m hermes -s "$skill" -z "$target_desc"
    )
    status=$?
    set -e

    if [ $status -eq 0 ]; then
        send_telegram "✅ *[Hermes]* Đã sửa lỗi CI thành công cho PR [#$num](https://github.com/thangvq95/thangvq-digital-hub/pull/$num)!"
    else
        send_telegram "❌ *[Hermes]* Xử lý sửa lỗi CI cho PR [#$num](https://github.com/thangvq95/thangvq-digital-hub/pull/$num) THẤT BẠI hoặc bị timeout (status: $status)!"
    fi

    git worktree remove --force "$worktree" || true
    mark_seen "$event_id"
done


echo "[INFO] Polling complete."
