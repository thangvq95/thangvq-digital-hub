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

### Architecture Principles

- **Stateless AI & Stateful Repo:** All AI Agents (Hermes, Cursor, Claude Code) are stateless. Project memory and context are strictly stored in the GitHub Repo (`CONTEXT.md`, `PRD.md`), Hermes Kanban (Task/DAG management), and PostgreSQL.
- **Hermes as a Remote Agent:** Hermes runs on the VPS in Docker, acting as both an Autonomous Worker (cronjobs, DAG automation) and a Remote Developer for heavy tasks, seamlessly interoperable with local agents. Hermes self-manages its internal state and skills natively without external orchestrators like LangGraph.
- **Hybrid Collaboration:** Local (Macbook) and remote (VPS) agents share the same source of truth via GitHub and Hermes Kanban. Execution consistency is maintained through 100% synchronization via the GitHub Repo.

### Coding rules

- Prefer Server Components; use `"use client"` only when needed.
- Keep components small + typed.
- No direct secrets in client code.
- **Think Before Coding:** State assumptions explicitly. If simpler approach exists, say so. Don't hide confusion.
- **Simplicity First:** Minimum code that solves the problem. No speculative features or abstractions.
- **Surgical Changes:** Touch only what you must. Don't refactor adjacent code unless asked. Clean up your own dead code, but leave pre-existing dead code alone.
- **Goal-Driven Execution:** Define verifiable success criteria (e.g., tests) before coding, and loop until verified.

### Recommended skills (Universal)

This repository uses [skills.sh](https://skills.sh/) to manage AI agent capabilities.
All skills are checked directly into the repository under `.agents/skills/` for offline availability and 100% reproducibility. Agents do NOT need to run any install command.
**Key skills loaded for this domain and their usage contexts:**

- `to-issues` (for breaking docs/PRD.md into tickets)
- `tdd` (for test-driven component/API creation)
- `diagnose` (for rigorous debugging loops)
- `improve-codebase-architecture` (when refactoring Next.js boundaries)
- `writing-plans` (for breaking approved designs into bite-sized, verifiable execution tasks)
- `ui-ux-pro-max` (for UI/UX design patterns, shadcn/ui best practices)
- `webapp-testing` (for Playwright-based local web app testing)
- `brainstorming` (for refining rough ideas, generating creative solutions, and exploring alternatives before implementation)
- `writing-skills` (for creating and testing new AI skills following best practices)
- `skill-creator` (for creating, modifying, testing, and benchmarking custom AI skills)
- `vercel-react-best-practices` (for enforcing Vercel's official React/Next.js performance guidelines and bundle optimizations)
- `vercel-composition-patterns` (for designing scalable, maintainable React component architecture without prop drilling)
- `codebase-migrate` (for large refactors and migrations)
- `pr-review-ci-fix` (for automated PR review + CI autofix)
- `sentry-triage` (for mapping Sentry errors to source)
- `grill-with-docs` (for stress-testing plans against existing domain architecture)
- `to-prd` (for generating PRDs from the current conversation context)
- `triage` (for managing and triaging issues through a structured workflow)
### Issue tracker

GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
