# 🌟 ThangVQ Digital Hub

A **Developer Intelligence Platform** — Portfolio + TechTrend Dashboard with AI-powered repository analysis.

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

| Layer            | Tech                                  | Hosting                     |
| ---------------- | ------------------------------------- | --------------------------- |
| Frontend         | Next.js 16, Tailwind CSS v4, ShadcnUI | Vercel                      |
| Backend API      | NestJS, TypeORM, PostgreSQL 16        | VPS (Docker)                |
| AI Agent & Graph | Hermes + GitNexus MCP Server + Skills | VPS (Docker `ai-workspace`) |
| DNS / Security   | Cloudflare WAF + Tunnel               | Cloudflare                  |

---

## Routes

| Route                  | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `/`                    | Portfolio — SSG, Liquid Glass design                  |
| `/tech`                | GitHub Trending repos (All, Favorites, Archived)      |
| `/tech/[owner]/[repo]` | Repo detail + release version tracking + AI summaries |

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
│   └── tech/                   # Dashboard (/tech/*)
├── backend/                    # NestJS API (standalone)
│   └── src/
│       ├── repos/              # GET/PATCH repos, POST upsert, POST analyze
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
Brainstorm → writing-plans → Hermes executes → Playwright tests → GitHub Issues → docs update
```

Skills live in `.agents/skills/` — committed to repo for offline access. See `AGENTS.md` for routing rules.

---

## CI/CD Pipeline (Orchestrated)

To prevent deployment race conditions between the Frontend (Vercel) and Backend (VPS), this project uses a synchronous GitHub Actions pipeline (`.github/workflows/deploy.yml`).

When code is merged into `main`:

1. **Backend First:** GitHub Actions SSHes into the VPS, pulls the latest code, and builds the API using Docker Compose.
2. **Health Check:** The pipeline waits and pings `/repos` until the API returns HTTP 200 OK.
3. **Frontend Second:** Only after the API is healthy, the pipeline triggers Vercel to build the Frontend via a Deploy Hook.

**Required GitHub Secrets:**

- `VPS_HOST`: IP address of the VPS.
- `VPS_USERNAME`: SSH username (e.g., `root` or `thang`).
- `VPS_SSH_KEY`: Private SSH key for accessing the VPS.
- `VPS_PROJECT_PATH`: Absolute path to the repository on the VPS (e.g., `/home/thang/Development/thangvq-digital-hub`).
- `VERCEL_DEPLOY_HOOK_URL`: The Deploy Hook URL from Vercel (Project Settings > Git > Deploy Hooks).

_Note: You MUST disable automatic deployments for the `main` branch in Vercel to allow this pipeline to act as the sole orchestrator._

---

## Release Process (Automated)

This project uses `release-please` and Conventional Commits for automated semantic versioning and changelog generation.

### How to Release:

1. **Development (`develop` branch):** All new features and bug fixes must be branched from and merged into the `develop` branch.
   - You (or the AI) must use **Conventional Commits** (e.g., `feat: add login`, `fix: header bug`).
2. **Triggering a Release:** When you are ready to release the features in `develop` to production, **manually create a Pull Request from `develop` to `main`**, and merge it.
3. **The Bot Takes Over (`release-please`):**
   - Once the code lands in `main`, the `release-please` GitHub Action runs automatically in the background.
   - It analyzes the commit history to determine the next semantic version (Major, Minor, or Patch) based on your commit types (`feat`, `fix`, `BREAKING CHANGE`).
   - The bot then **automatically creates a new "Release PR"** against `main` (e.g., `chore(main): release 1.2.0`). This PR contains updates to `package.json` (version bump) and generates a fresh `CHANGELOG.md`.
4. **Finalize Release:** You review the bot's Release PR. If everything looks good, you merge it.
   - Upon merging the Release PR, the bot creates a GitHub Release and tags the repository (`v1.2.0`). Your production CI/CD (Vercel) can then trigger deployments off this tag/main branch.

---

## Docs

| Document                            | Purpose                                                     |
| ----------------------------------- | ----------------------------------------------------------- |
| [PRD.md](docs/PRD.md)               | Product requirements & architecture overview                |
| [CONTEXT.md](CONTEXT.md)            | Domain terms & architecture rules                           |
| [AGENTS.md](AGENTS.md)              | AI agent rules, skill routing                               |
| [architecture/](docs/architecture/) | Deep-dive: sync lifecycle, release pipeline, task execution |
