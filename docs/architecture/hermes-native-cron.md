# Hermes Native Polling Orchestrator

To replace the `listener.py` webhook workflow (which required exposing a public endpoint and managing a separate background Python server loop), this project now uses the native **Hermes cron scheduler** to poll GitHub every 10 minutes.

This approach offers better stability, native deduplication logging within Hermes sessions, no required Docker volumes for deduplication DBs outside the standard Hermes volume, and no open ports.

## Setup Instructions

1. **Ensure Prerequisites on VPS:**
   - `sqlite3`, `gh`, and `jq` installed on the host or inside the container where Hermes runs.
   - You must be authenticated to GitHub CLI (`gh auth status`).

2. **Copy the polling script to the Hermes script directory:**

   ```bash
   mkdir -p ~/.hermes/scripts
   cp infra/scripts/hermes-gh-poll.sh ~/.hermes/scripts/
   chmod +x ~/.hermes/scripts/hermes-gh-poll.sh
   ```

3. **Create the native cron job:**
   Run this command in the environment where the Hermes gateway runs:
   ```bash
   hermes cron create "*/10 * * * *" \
       --name "gh-issue-polling" \
       --script "hermes-gh-poll.sh" \
       --no-agent
   ```
   _Note: `--no-agent` ensures the script is executed purely as a standard bash script every 10 minutes without wrapping it in an LLM reasoning loop, saving tokens and speeding up the execution. The script will internally spawn `hermes -z` tasks dynamically when actual work needs to be done._

## How It Works

- The `hermes-gh-poll.sh` script queries GitHub via `gh issue list` and `gh pr list`.
- It tracks processed issues/PRs inside an SQLite database (`ai-workspace.db`).
- Based on triage labels (`bug`, `feature`, `plan`), it selects the appropriate Hermes skill (`diagnose`, `to-prd`, `writing-plans`).
- It creates a temporary Git worktree, spawns a `hermes -z` headless worker with the corresponding skill and prompt.
- After the agent finishes its work (which includes verifying and pushing the fix), the orchestrator script removes the temporary worktree.
- If the `main` branch updates, it triggers `gitnexus analyze`.
