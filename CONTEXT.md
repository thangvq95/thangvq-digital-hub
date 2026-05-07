# Domain Context: ThangVQ Digital Hub

## Core Purpose

Developer Intelligence Platform — Portfolio + TechTrend Dashboard with AI-powered release monitoring.

## Key Terminology

- **Hermes Agent** — Autonomous executor on Mac Mini M4 Pro. Writes code, runs tests, syncs tasks, analyzes releases.
- **Spec Kit** — Architect/Planner. Defines specs, plans, and tasks. Single source of truth for logic changes.
- **GitNexus** — Knowledge graph providing codebase context to Hermes via MCP.
- **Playwright** — Automated E2E & API testing. All tasks require passing tests (TDD).
- **GitHub Projects** — Kanban dashboard for task tracking (To-do / In Progress / Done).
- **TechTrend** — Developer intelligence dashboard showing trending repos + AI-analyzed releases.
- **Release Feed** — Cross-repo timeline of AI-analyzed releases from favorited repositories.
- **NestJS API** — Backend service running on VPS via Docker.
- **PostgreSQL** — Primary database (repos, releases, sync logs).
- **9Router** — API Gateway/Proxy at `https://9router.phieucaphe.com/v1`.

## Autonomous Workflow (The Loop)

1. **Planning** → Hermes + GitNexus + Spec Kit → Spec & Plan
2. **Tasking** → Tasks extracted → GitHub Projects Issues
3. **Execution** → Phase+DAG ordering → Playwright TDD → Self-healing
4. **Documentation** → Update docs → Close Issue

## Task Execution Model

- Top-level: Phase-based grouping (human-readable)
- Within phase: Dependency DAG (parallel when possible)
- States: READY → BLOCKED → RUNNING → FAILED → DONE
- Details: `docs/architecture/task-execution-model.md`

## Architecture Rules

- Next.js 16 App Router (no `pages/`).
- Tailwind v4 + ShadcnUI.
- NestJS + PostgreSQL (self-hosted Docker on DigitalOcean / Mac Mini).
- Vercel for frontend hosting.
- Cloudflare WAF + 9Router Proxy for security/networking.
- Test First: No code without passing Playwright tests.
- Single Source of Truth: All logic changes start from Spec Kit specs.
- PRD stays concise; deep mechanics in `docs/architecture/`.
