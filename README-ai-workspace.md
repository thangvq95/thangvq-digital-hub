# ThangVQ AI Developer Workspace (Hermes Agent)

This directory contains:

- `infra/ai-developer-workspace/listener.py` – a minimal HTTP server that receives GitHub webhook events, validates them, and triggers Hermes to execute tasks.
- `scripts/setup-vps.sh` – a bootstrap script to deploy the workspace via Docker.

## How it works

1. The listener runs as a systemd service on your VPS.
2. When GitHub sends a webhook (e.g., `check_run.completed`), the listener:
   - Verifies the HMAC secret.
   - Deduplicates using the `X-GitHub-Delivery` header and a local SQLite cache.
   - Extracts the PR number and head branch/ref.
   - Creates a git worktree from the base clone at that ref.
   - Runs `hermes -w <worktree> -s gh-fix-ci -c "fix PR <number>"`.
   - Removes the worktree after Hermes finishes.
3. Hermes uses the `gh-fix-ci` skill (repo‑local) to inspect the failure and push a fix back to the same branch.

## Deployment

### Prerequisites on the VPS

- **Docker & Docker Compose** installed.
- (Optional but recommended) Authenticated GitHub CLI (`gh`) or SSH keys in your home directory `~/.ssh` so the Hermes agent can push code.

### One‑line deploy

Instead of installing packages directly on your VPS, everything is containerized.
1. SSH into your VPS.
2. Clone this repository (if not already done).
3. Copy the environment variables template:

```bash
cd thangvq-digital-hub/infra
cp ai-developer-workspace/.env.example .env
```

4. Edit `.env` to set your `WEBHOOK_SECRET`.
5. Run the container:

```bash
docker compose up -d
```

The Docker Compose configuration will:
- Build an image containing Python, Node.js, Git, and GitHub CLI.
- Mount the current repository so the agent can read/write the codebase.
- Mount your SSH keys/GH config so the agent can authenticate with GitHub.
- Expose the listener on the configured port.


### GitHub webhook setup

In your repository Settings → Webhooks:
- Payload URL: `http://<your-vps-ip>:<PORT>/` (the listener root; it accepts POST on `/`).
- Content type: `application/json`
- Secret: same as `WEBHOOK_SECRET` in `.env`
- Which events: Let me select individual events → check:
  - Check run
  - Check suite
  - Pull request

## Development

To run the listener locally for testing:

```bash
# 1. Create venv if not exists
python3 -m venv infra/ai-developer-workspace/.venv
source infra/ai-developer-workspace/.venv/bin/activate

# 2. Export env vars (or use .env)
export WEBHOOK_SECRET=testsecret
export BASE_REPO=$(pwd)
export PORT=8080

# 3. Run
python infra/ai-developer-workspace/listener.py
```

You can then send test payloads with `curl` or use [https://webhook.site](https://webhook.site) to verify.

### Configuration

The listener reads configuration from `infra/.env` (not committed). Copy the example:

## Notes

- The listener is intentionally simple and dependency‑light. For production you may want to add:
  - Structured logging.
  - Metrics (e.g., Prometheus).
  - Graceful shutdown.
- The worktree base clone should be kept updated (e.g., via a cron `git fetch origin` or the listener can fetch on each event).
- Hermes must be able to push without interaction; ensure SSH agent forwarding or `gh` auth is set up for the service user.
