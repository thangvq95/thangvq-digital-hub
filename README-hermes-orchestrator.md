# Hermes AI Agent Workspace

Hermes runs on the VPS inside Docker, acting as both an **Autonomous Worker** (cronjobs, trending sync, release analysis) and a **Remote Developer** (polling-triggered CI fixes).

---

## How It Works

```
Cron Scheduler (10m)
                     ↓ Fetch GH Issues/PRs
                     ↓ SQLite dedup
                     ↓ extract PR / branch
                     ↓ git worktree
                     ↓ hermes -s <skill> -c "<task>"
                     ↓ push fix back to branch
                     ↓ cleanup worktree
```

Hermes also runs **scheduled cronjobs** independently (no webhook needed):

| Cronjob                  | Schedule       | Action                                                                   |
| ------------------------ | -------------- | ------------------------------------------------------------------------ |
| Weekly Trending Sync     | `0 8,20 * * *` | Scrape GitHub Trending (Weekly) → `POST /api/repos/upsert`               |
| Favorite Release Monitor | `0 10 * * *`   | Check favorite repos for new releases → `POST /api/repos/check-releases` |

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

| Container             | Port | Description                                |
| --------------------- | ---- | ------------------------------------------ |
| `digitalhub-postgres` | 5432 | PostgreSQL 16 database                     |
| `digitalhub-api`      | 3001 | NestJS API (auto-migrates schema on start) |
| `hermes-gateway`      | 9119 | Hermes Kanban Dashboard UI                 |

### Troubleshooting: 9Router Cloudflare WAF (HTTP 403 Block)

**Problem:**  
The custom OpenAI gateway endpoint `https://9router.phieucaphe.com/v1` uses Cloudflare, which is configured to block or challenge `POST` requests (like chat completions) coming from hosting/datacenter IPs if they carry default developer User-Agents (such as `OpenAI/Python` or `httpx`), returning `HTTP 403 Forbidden` ("Your request was blocked.").

**Solution:**  
We use a global Python startup monkeypatch (`sitecustomize.py`) to transparently override all outgoing `httpx` User-Agent headers with a standard Chrome browser User-Agent.

Since CLI wrappers sometimes clear `PYTHONPATH`, the patch must be copied directly into the virtual environment's `site-packages` directory inside the container:

```bash
# 1. Pull the latest patch file
git pull origin main

# 2. Copy the patch directly into the container's Python virtual environment
docker compose -f infra/docker-compose.yml exec -T hermes-gateway cp /app/repo/infra/patches/sitecustomize.py /usr/local/lib/hermes-agent/venv/lib/python3.11/site-packages/sitecustomize.py

# 3. Test your connection directly by entering chat
docker compose -f infra/docker-compose.yml exec -it hermes-gateway hermes
```

_(Note: The Dockerfile has been updated to automatically apply this patch on builds, but if you run containers without rebuilding, use the copy command above)._

---

## Cloudflare Tunnel (Recommended)

Instead of exposing ports directly, use Cloudflare Tunnel to securely route traffic:

```bash
# cloudflared runs automatically in Docker via docker-compose.yml
```

Routes:

- `thangvq95.page` → Vercel (frontend)
- `api.thangvq95.page` → `http://api:3001` (NestJS API)
- `kanban.thangvq95.page` → `http://hermes-gateway:9119` (Hermes Kanban)

---

## Skills

All Superpowers skills are committed to `.agents/skills/` for **offline, reproducible** execution. Hermes does not need internet to load skills.

Key skills used by Hermes:

| Skill              | When                           |
| ------------------ | ------------------------------ |
| `tdd`              | Writing tests + implementation |
| `diagnose`         | Debugging CI failures          |
| `writing-plans`    | Breaking specs into tasks      |
| `pr-review-ci-fix` | Auto-fixing failing PRs        |

---
