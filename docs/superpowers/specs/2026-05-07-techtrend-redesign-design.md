# TechTrend Redesign — Developer Intelligence System

> **Date:** 2026-05-07
> **Status:** Approved
> **Scope:** TechTrend Dashboard rework, PRD restructuring, Autonomous Workflow formalization

---

## 1. Problem Statement

The current TechTrend Dashboard is a GitHub Trending viewer. It needs to evolve into a **personalized software ecosystem monitoring system** with:

- Favorite release tracking with AI-powered analysis
- Unviewed repo/release highlighting
- Phase+DAG task execution model for Hermes
- Proper document separation (PRD vs portfolio content vs architecture docs)
- Web-focused tech stack (remove mobile references from architecture)

## 2. Design Decisions

### 2.1 Release Feed: Dual-Layer Architecture

- **Signal detection layer** — `/tech/releases` global feed for daily scanning across all favorites
- **Deep-dive layer** — `/tech/[repo]` detail page with full AI changelog, migration notes, breaking changes

Release summaries are **persisted in PostgreSQL** (not generated on-demand) via `repo_releases` table.

### 2.2 Task Execution: Phase + DAG Hybrid

- **Top-level:** Phase-based grouping (human-readable, auditable in GitHub Projects)
- **Execution engine:** Explicit dependency DAG inside each phase
- **Parallel execution** when dependencies allow
- **State machine:** `READY → BLOCKED → RUNNING → FAILED → DONE`

### 2.3 Document Structure

```
docs/
├── PRD.md                              # High-level system contract
├── portfolio-content.md                # Personal content (About, Experience, etc.)
└── architecture/
    ├── task-execution-model.md         # Phase + DAG + state machine
    ├── release-analysis-pipeline.md    # Favorite monitoring + AI analysis
    └── repo-sync-lifecycle.md          # Trending sync cronjob flow
```

### 2.4 Deployment Target

DigitalOcean or self-hosted Mac Mini M4 Pro (future decision). Vercel for frontend.

## 3. Data Model

### 3.1 `repositories` — New Fields

```sql
is_viewed               BOOLEAN DEFAULT FALSE,
viewed_at               TIMESTAMPTZ,
last_release_checked_at TIMESTAMPTZ
```

### 3.2 `repo_releases` — New Table

```sql
CREATE TABLE repo_releases (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_full_name    TEXT NOT NULL REFERENCES repositories(full_name),
    release_tag       TEXT NOT NULL,
    release_title     TEXT,
    release_url       TEXT,
    published_at      TIMESTAMPTZ,
    changelog_raw     TEXT,
    release_body_hash TEXT,
    ai_summary        TEXT,
    breaking_changes  TEXT,
    migration_notes   TEXT,
    relevance_score   SMALLINT CHECK (relevance_score BETWEEN 0 AND 100),
    is_viewed         BOOLEAN DEFAULT FALSE,
    processed_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(repo_full_name, release_tag)
);
```

**Relevance scoring:**
- 0–30: Low signal (patch fixes, minor docs)
- 31–70: Meaningful update (new features, deprecations)
- 71–100: High-impact release (breaking changes, major versions)

### 3.3 Future Table (noted, not implemented v1)

`repo_release_processing_logs` — for tracking AI analysis failures, retries, token usage, model versions, latency.

## 4. Routes

```
/tech                   → redirect to /tech/trending
/tech/trending          → GitHub Trending repos (daily/weekly/monthly)
/tech/releases          → Cross-repo release feed (favorites only)
/tech/favorites         → Favorited repos
/tech/[repo]            → Repo detail + releases + AI summaries + notes
```

## 5. Cronjob Pipelines

| Cronjob | Target | Schedule | Action |
|---|---|---|---|
| Trending Sync | All repos | `0 8,20 * * *` (2x daily), weekly Mon 9AM, monthly 1st 9AM | Scrape trending → upsert rankings/stars/domains |
| Favorite Release Monitor | `is_favorite = true` | `0 10 * * *` (daily 10AM) | Check GitHub Releases API → AI analyze new releases → insert `repo_releases` |

## 6. Task Metadata Schema

```yaml
TaskMetadata:
  id: string
  phase: number
  depends_on: string[]
  inputs: string[]
  outputs: string[]
  context_requirements: string[]    # GitNexus context paths
  validation: string
  rollback: string
  estimated_scope: "small" | "medium" | "large"
  retry_policy:
    max_retries: 3
    backoff: "exponential"
```

## 7. Tech Stack (Corrected)

| Category | Technologies |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, ShadcnUI |
| Backend | NestJS, TypeScript, PostgreSQL |
| Infrastructure | Docker, Cloudflare, Vercel, 9Router |
| AI Orchestration | Hermes Agent, Spec Kit, GitNexus |
| Testing | Playwright (E2E + API) |
| Project Management | GitHub Projects + Issues |

## 8. Out of Scope (v1)

- AI digest emails
- Semantic search across releases
- "Repos similar to favorites" recommendations
- Release impact scoring aggregation
- `repo_release_processing_logs` table
- `agent-recovery-strategy.md` architecture doc
