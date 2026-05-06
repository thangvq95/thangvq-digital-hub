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

This repository uses [skills.sh](https://skills.sh/) to manage AI agent capabilities.
All skills are checked directly into the repository under `.agents/skills/` for offline availability and 100% reproducibility. Agents do NOT need to run any install command.
**Key skills loaded for this domain and their usage contexts:**

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
- `brainstorming` (for refining rough ideas, generating creative solutions, and exploring alternatives before implementation)
- `writing-skills` (for creating and testing new AI skills following best practices)
- `skill-creator` (for creating, modifying, testing, and benchmarking custom AI skills)
- `vercel-react-best-practices` (for enforcing Vercel's official React/Next.js performance guidelines and bundle optimizations)
- `vercel-composition-patterns` (for designing scalable, maintainable React component architecture without prop drilling)
- `web-design-guidelines` (for auditing UI code against web accessibility and best interface practices)
- `codebase-migrate` (for large refactors and migrations)
- `create-plan` (for quick execution plans before coding)
- `gh-fix-ci` (for inspecting and fixing GitHub Actions failures)
- `pr-review-ci-fix` (for automated PR review + CI autofix)
- `sentry-triage` (for mapping Sentry errors to source)
- `find-skills` (for discovering and installing new agent capabilities)
- `grill-with-docs` (for stress-testing plans against existing domain architecture)
- `to-prd` (for generating PRDs from the current conversation context)
- `triage` (for managing and triaging issues through a structured workflow)
### Issue tracker

GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
