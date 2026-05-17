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

- **Stateless AI & Stateful Repo:** All AI Agents (Hermes, Cursor, Claude Code) are stateless. Project memory and context are strictly stored in the GitHub Repo (`CONTEXT.md`, `PRD.md`), GitHub Projects/Issues (Task management), and PostgreSQL.
- **Hermes as a Remote Agent:** Hermes runs on the VPS in Docker, acting as both an Autonomous Worker (cronjobs, DAG automation) and a Remote Developer for heavy tasks, seamlessly interoperable with local agents. Hermes self-manages its internal state and skills natively without external orchestrators like LangGraph.
- **Hybrid Collaboration:** Local (Macbook) and remote (VPS) agents share the same source of truth via GitHub. Execution consistency is maintained through 100% synchronization via the GitHub Repo.

### Coding rules

- Prefer Server Components; use `"use client"` only when needed.
- Keep components small + typed.
- No direct secrets in client code.
- **Think Before Coding:** State assumptions explicitly. If simpler approach exists, say so. Don't hide confusion.
- **Simplicity First:** Minimum code that solves the problem. No speculative features or abstractions.
- **Surgical Changes:** Touch only what you must. Don't refactor adjacent code unless asked. Clean up your own dead code, but leave pre-existing dead code alone.
- **Goal-Driven Execution:** Define verifiable success criteria (e.g., tests) before coding, and loop until verified.
- **Mandatory Validation Hook:** After generating or modifying code, ALWAYS use the `verify` skill or run `npm run lint` & `npm run build` locally to prove the code works before reporting back. If errors occur, auto-fix them immediately.

### Git & PR Workflow (Crucial for Autonomous Agents)

- **NEVER Push to Main:** The `main` branch is protected. Autonomous agents must never push directly to it.
- **Branching:** When starting work on an issue, ALWAYS create a new branch: `git checkout -b fix/issue-<id>` or `feat/issue-<id>`.
- **Pull Request:** After committing your changes and verifying tests pass, you MUST create a Pull Request using the GitHub CLI: `gh pr create --fill`.
- **Commit Formatting (Husky + Conventional Commits):** This project enforces Conventional Commits via Husky (`commitlint`). You MUST format all commit messages according to this standard (e.g., `feat: <description>`, `fix: <description>`, `chore: <description>`). This is required for the `release-please` automated versioning system to work properly. The `pre-commit` hook will also automatically run `lint-staged`.
- **Completion:** Do not close the issue manually. Let the PR merge process close it automatically.

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
- `sentry-fix-issues` (for analyzing and fixing Sentry errors via API)
- `grill-with-docs` (for stress-testing plans against existing domain architecture)
- `to-prd` (for generating PRDs from the current conversation context)
- `triage` (for managing and triaging issues through a structured workflow)
- `verify` (for verifying that a code change actually works by running the app and observing runtime behavior instead of just looking at code)

### Issue tracker

GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **thangvq-digital-hub** (802 symbols, 989 relationships, 0 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource                                             | Use for                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| `gitnexus://repo/thangvq-digital-hub/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/thangvq-digital-hub/clusters`       | All functional areas                     |
| `gitnexus://repo/thangvq-digital-hub/processes`      | All execution flows                      |
| `gitnexus://repo/thangvq-digital-hub/process/{name}` | Step-by-step execution trace             |

## CLI

| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |

<!-- gitnexus:end -->
