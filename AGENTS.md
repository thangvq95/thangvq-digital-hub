## Agent rules (universal)

### Source of truth

- `docs/PRD.md` for product/roadmap.
- `CONTEXT.md` for domain terms + architecture rules.
- `docs/adr/` for decisions.
- `design-system/MASTER.md` for UI/UX rules, colors, and styling patterns.

### Stack & structure

- Next.js 14+ App Router (no `pages/`).
- Tailwind CSS v4 + ShadcnUI.
- NestJS API + PostgreSQL (Docker/VPS).
- `app/` routes: `/` portfolio, `/tech` dashboard.
- UI components in `components/portfolio/` and `components/dashboard/`.

### Coding rules

- Prefer Server Components; use `"use client"` only when needed.
- Keep components small + typed.
- No direct secrets in client code.

### Recommended skills (Universal)

When working on this codebase, AI agents with skill systems (Hermes, OpenClaw, Antigravity) should load:
- `to-issues` (for breaking docs/PRD.md into tickets)
- `tdd` (for test-driven component/API creation)
- `diagnose` (for rigorous debugging loops)
- `improve-codebase-architecture` (when refactoring Next.js boundaries)
- `writing-plans` (before executing complex feature changes)
- `frontend-design` (for styling Next.js components)
- `ui-ux-pro-max` (for UI/UX design patterns, shadcn/ui best practices)
- `web-artifacts-builder` (for creating UI prototypes before implementing)
- `webapp-testing` (for Playwright-based local web app testing)
- `karpathy-guidelines` (for simple, surgical, verifiable code changes)

- `codebase-migrate` (for large refactors and migrations)
- `create-plan` (for quick execution plans before coding)
- `gh-fix-ci` (for inspecting and fixing GitHub Actions failures)
- `pr-review-ci-fix` (for automated PR review + CI autofix)
- `sentry-triage` (for mapping Sentry errors to source)
### Issue tracker

GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
