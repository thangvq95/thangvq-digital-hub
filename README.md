# 🌟 ThangVQ Digital Hub

A **Developer Intelligence Platform** — Portfolio + TechTrend Dashboard with AI-powered release monitoring.

Live: **[thangvq95.page](https://thangvq95.page)**

---

## Architecture

```
User → Cloudflare → Vercel (Next.js 16)
                       ↓
              api.thangvq95.page (NestJS API)
                       ↓
              PostgreSQL ← Hermes Agent (VPS)
```

| Layer | Tech | Hosting |
|---|---|---|
| Frontend | Next.js 16, Tailwind CSS v4, ShadcnUI | Vercel |
| Backend API | NestJS, TypeORM, PostgreSQL 16 | VPS / Mac Mini (Docker) |
| AI Agent | Hermes + Superpowers Skills | VPS (Docker) |
| DNS / Security | Cloudflare WAF + Tunnel | Cloudflare |

---

## Routes

| Route | Description |
|---|---|
| `/` | Portfolio — SSG, Liquid Glass design |
| `/tech/trending` | GitHub Trending repos (daily/weekly/monthly) |
| `/tech/releases` | AI-analyzed release feed from favorited repos |
| `/tech/favorites` | Favorited repositories |
| `/tech/[repo]` | Repo detail + release history + AI summaries |

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js** 20+ (LTS)
- **Docker Desktop** (for PostgreSQL + NestJS API)

### 1. Frontend (Next.js)

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                         # → http://localhost:3000
```

### 2. Backend API + Database (Docker)

```bash
cd infra
cp .env.example .env    # fill in POSTGRES_PASSWORD, SYNC_API_KEY, NODE_ENV=development
docker compose --env-file .env up -d postgres api
# NestJS API → http://localhost:3001
```

### 3. Run E2E Tests

```bash
npx playwright test tests/portfolio.spec.ts --project=chromium
```

---

## Project Structure

```
/thangvq-digital-hub
├── app/                        # Next.js App Router
│   ├── page.tsx                # Portfolio (/)
│   ├── tech/                   # Dashboard (/tech/*)
│   └── api/                    # Next.js API proxy routes
├── backend/                    # NestJS API (standalone)
│   └── src/
│       ├── repos/              # GET/PATCH repos, POST upsert
│       ├── releases/           # GET feed, POST upsert
│       ├── sync/               # GET latest sync log
│       └── auth/               # API key guard (Hermes endpoints)
├── components/
│   ├── portfolio/              # Portfolio page sections
│   └── dashboard/              # TechTrend dashboard components
├── lib/api/                    # Frontend API client + types
├── infra/
│   ├── docker-compose.yml      # postgres + api + ai-workspace
│   ├── .env                    # Secrets (gitignored — create manually)
│   └── ai-developer-workspace/ # Hermes webhook listener (Docker)
├── .agents/skills/             # Superpowers AI skills (offline)
├── docs/
│   ├── PRD.md                  # Product requirements
│   ├── architecture/           # Deep-dive architecture docs
│   └── superpowers/plans/      # Implementation plans
├── tests/                      # Playwright E2E tests
├── AGENTS.md                   # AI agent rules & skill routing
└── CONTEXT.md                  # Domain dictionary for agents
```

---

## Environment Variables

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://api.thangvq95.page
SYNC_API_KEY=<secret>
```

### VPS — `infra/.env` (create manually, never commit)
```env
SYNC_API_KEY=<secret>           # Must match Vercel + Hermes
PORT=3001
NODE_ENV=production
POSTGRES_PASSWORD=<secret>
WEBHOOK_SECRET=<secret>         # GitHub webhook HMAC
HERMES_BIN=hermes
BASE_REPO=/app/repo
WORKTREES_DIR=/app/worktrees
DEDUP_DB=/app/data/ai-workspace.db
```

Generate secrets:
```bash
openssl rand -hex 32   # for SYNC_API_KEY, WEBHOOK_SECRET
openssl rand -hex 16   # for POSTGRES_PASSWORD
```

---

## AI Agent Workflow

```
Brainstorm → writing-plans → Hermes executes → Playwright tests → Hermes Kanban → docs update
```

Skills live in `.agents/skills/` — committed to repo for offline access. See `AGENTS.md` for routing rules.

---

## Docs

| Document | Purpose |
|---|---|
| [PRD.md](docs/PRD.md) | Product requirements & architecture overview |
| [CONTEXT.md](CONTEXT.md) | Domain terms & architecture rules |
| [AGENTS.md](AGENTS.md) | AI agent rules, skill routing |
| [architecture/](docs/architecture/) | Deep-dive: sync lifecycle, release pipeline, task execution |
