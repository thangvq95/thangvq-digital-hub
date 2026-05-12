# Hermes AI Agent Workspace

Hermes runs on the VPS inside Docker, acting as both an **Autonomous Worker** (cronjobs, trending sync, release analysis) and a **Remote Developer** (webhook-triggered CI fixes).

---

## How It Works

```
GitHub Webhook → listener.py (port 8080)
                     ↓ HMAC verify + SQLite dedup
                     ↓ extract PR / branch
                     ↓ git worktree
                     ↓ hermes -s <skill> -c "<task>"
                     ↓ push fix back to branch
                     ↓ cleanup worktree
```

Hermes also runs **scheduled cronjobs** independently (no webhook needed):

| Cronjob | Schedule | Action |
|---|---|---|
| Weekly Trending Sync | `0 8,20 * * *` | Scrape GitHub Trending (Weekly) → `POST /api/repos/upsert` |
| Favorite Release Monitor | `0 10 * * *` | Check favorite repos for new releases → `POST /api/repos/check-releases` |

---

## Deployment (VPS)

### Prerequisites
- Docker & Docker Compose installed on VPS
- SSH keys or `gh auth login` configured

### Steps

```bash
# 1. SSH into VPS, clone repo
git clone git@github.com:thangvq95/thangvq-digital-hub.git
cd thangvq-digital-hub/infra

# 2. Create env file (never committed)
cat > .env << 'EOF'
SYNC_API_KEY=<your-sync-api-key>
PORT=3001
NODE_ENV=production
POSTGRES_PASSWORD=<your-postgres-password>
WEBHOOK_SECRET=<your-webhook-secret>
HERMES_BIN=hermes
BASE_REPO=/app/repo
WORKTREES_DIR=/app/worktrees
DEDUP_DB=/app/data/ai-workspace.db
EOF
chmod 600 .env

# 3. Start all services
docker compose --env-file .env up -d

# 4. Verify
docker compose ps
curl http://localhost:3001/api/sync
```

### Services

| Container | Port | Description |
|---|---|---|
| `digitalhub-postgres` | 5432 | PostgreSQL 16 database |
| `digitalhub-api` | 3001 | NestJS API (auto-migrates schema on start) |
| `ai-developer-workspace` | 8080 | Hermes webhook listener + GitNexus Global Knowledge Graph |
| `hermes-gateway` | 9119 | Hermes Kanban Dashboard UI |

---

## GitHub Webhook Setup

In GitHub repo → Settings → Webhooks:

| Field | Value |
|---|---|
| Payload URL | `https://webhook.<your-domain>/` (via Cloudflare Tunnel) |
| Content type | `application/json` |
| Secret | Same as `WEBHOOK_SECRET` in `infra/.env` |
| Events | Check run, Check suite, Pull request |

---

## Cloudflare Tunnel (Recommended)

Instead of exposing ports directly, use Cloudflare Tunnel to securely route traffic:

```bash
# cloudflared runs automatically in Docker via docker-compose.yml
```

Routes:
- `thangvq95.page` → Vercel (frontend)
- `api.thangvq95.page` → `http://api:3001` (NestJS API)
- `webhook.thangvq95.page` → `http://ai-workspace:8080` (Hermes Listener)
- `kanban.thangvq95.page` → `http://hermes-gateway:9119` (Hermes Kanban)

---

## Skills

All Superpowers skills are committed to `.agents/skills/` for **offline, reproducible** execution. Hermes does not need internet to load skills.

Key skills used by Hermes:

| Skill | When |
|---|---|
| `tdd` | Writing tests + implementation |
| `diagnose` | Debugging CI failures |
| `writing-plans` | Breaking specs into tasks |
| `pr-review-ci-fix` | Auto-fixing failing PRs |

---

## Local Testing

Run the listener locally (no Docker needed):

```bash
python3 -m venv infra/ai-developer-workspace/.venv
source infra/ai-developer-workspace/.venv/bin/activate

export WEBHOOK_SECRET=testsecret
export BASE_REPO=$(pwd)
export PORT=8080

python infra/ai-developer-workspace/listener.py
```

Send a test payload:
```bash
curl -X POST http://localhost:8080/ \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: check_run" \
  -d '{"action":"completed"}'
```
