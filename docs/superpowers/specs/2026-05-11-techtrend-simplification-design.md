# TechTrend Simplification — Design Spec

> **Date:** 2026-05-11 (updated: release tracking & markdown AI summary)
> **Status:** Approved (user-directed pivot)
> **Supersedes:** Previous TechTrend specs from 2026-05-07

---

## Context & Motivation

The original TechTrend design was over-engineered for the actual use case. It had:
- 3 separate trending syncs (daily/weekly/monthly) with rank columns
- AI domain classification during scraping
- Full release monitoring pipeline with relevance scoring
- Complex filtering (period/domain/favorites/search)

**New direction:** Strip it back to a simple, useful workflow:
1. Hermes scrapes GitHub Weekly Trending (first page, ~25 repos) twice daily
2. Repos are deduplicated and displayed in GitHub's original order
3. User can favorite or archive repos
4. Detail page starts empty — a "Magic" button triggers AI to read and explain the repo (output stored as **Markdown**)
5. A second cronjob monitors **favorite repos** for new GitHub releases and highlights them in the UI

---

## Feature Spec

### 1. Trending Sync (Hermes Cronjob)

- **Schedule:** 2x daily via Hermes Cron page — `0 8,20 * * *` (8AM & 8PM UTC+7)
- **Source:** `https://github.com/trending?since=weekly` (first page only, ~25 repos)
- **Data scraped per repo:**
  - `full_name` (owner/repo)
  - `description`
  - `html_url`
  - `language`
  - `stars_total`
  - `stars_growth` (e.g. "1,234 stars this week")
  - `forks_total`
  - `avatar_url`
  - `trending_rank` (1-25, position on page)
- **Dedup logic:** Check if `full_name` already exists in DB → if yes, skip entirely. If no, insert as new.
- **New repos** are inserted with `has_new_release = false` and `latest_release_tag = null`.
- **No rank reset.** Old repos stay. New repos are added. This creates an ever-growing curated list.

### 2. Dashboard Page (`/tech`)

- **Default view:** All non-archived repos, ordered by `first_seen_at DESC` (newest first)
- **Pagination:** Load more button, 20 items per batch
- **Card displays:** repo name, description, language badge, stars, stars growth, avatar
- **Card actions:** Favorite toggle (heart icon), Archive button
- **New release badge:** If `has_new_release = true`, show a highlight badge on the card (e.g. dot indicator or "New Release" tag)
- **Filter tabs:** "All" | "Favorites" | "Archived" (simple tabs, no complex filters)
- **No search bar** in v1 (YAGNI)

### 3. Repo Detail Page (`/tech/[owner]/[repo]`)

- **Initial state:** "Empty" page with:
  - Repo name + link to GitHub
  - Favorite toggle button
  - Archive button
  - **Release section:** Shows `latest_release_tag` (if any) + a link to the repo's GitHub Releases page (`https://github.com/{owner}/{repo}/releases`). Clicking the link also calls PATCH to set `has_new_release = false`. If the repo has no releases, show "No releases published".
  - A prominent **"✨ Magic Analyze"** button
- **Magic Analyze flow:**
  - User clicks the button
  - Frontend calls `POST /api/repos/{fullName}/analyze`
  - Backend (or Hermes) reads the repo's README + structure via GitHub API
  - AI generates a **Markdown-formatted** summary covering:
    - What is this repo?
    - What is its purpose?
    - Real-world applications & use cases
    - (NOT installation instructions)
  - Summary is saved to `ai_summary` column on the repo (as **raw Markdown text**)
  - Page re-renders with the AI summary displayed using `react-markdown`
- **After analysis:** The summary is cached permanently — button changes to "Re-analyze" for future updates

### 4. Favorite Release Monitor (Hermes Cronjob #2)

- **Schedule:** Daily via Hermes Cron page — `0 10 * * *` (10AM UTC+7)
- **Target:** All repos where `is_favorite = true`
- **Flow:**
  1. Fetch all favorite repos from DB via `GET /api/repos?tab=favorites`
  2. For each repo, call GitHub API: `GET https://api.github.com/repos/{owner}/{repo}/releases/latest`
  3. Compare response's `tag_name` with the stored `latest_release_tag`
  4. If different (or repo had no `latest_release_tag` before): update `latest_release_tag` + set `has_new_release = true`
  5. If same: skip (no change)
  6. If GitHub returns 404 (no releases): skip, leave fields as-is
- **Result:** Repos with new releases get highlighted in the dashboard UI

### 5. User Actions

| Action | Scope | Effect |
|---|---|---|
| **Favorite** | Card + Detail | Toggles `is_favorite` — appears in Favorites tab |
| **Archive** | Card + Detail | Sets `is_archived = true` — hidden from default view, visible in Archived tab |
| **Magic Analyze** | Detail only | Triggers AI read + summary generation (stored as Markdown) |
| **View Changelog** | Detail only | Opens GitHub Releases page in new tab + sets `has_new_release = false` |

---

## Database Schema (Simplified)

### `repositories` table (simplified from old design)

```sql
CREATE TABLE repositories (
    full_name           TEXT PRIMARY KEY,
    description         TEXT,
    html_url            TEXT NOT NULL,
    language            TEXT,
    avatar_url          TEXT,
    stars_total         INTEGER DEFAULT 0,
    stars_growth        TEXT,
    forks_total         INTEGER DEFAULT 0,
    trending_rank       SMALLINT,               -- Position on GitHub trending page when first seen
    is_favorite         BOOLEAN DEFAULT FALSE,
    is_archived         BOOLEAN DEFAULT FALSE,
    latest_release_tag  TEXT,                    -- e.g. "v3.2.1" — latest known release tag
    has_new_release     BOOLEAN DEFAULT FALSE,   -- TRUE when a new release is detected (reset on changelog view)
    ai_summary          TEXT,                    -- AI-generated repo explanation (Markdown format)
    first_seen_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repos_favorite ON repositories(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_repos_archived ON repositories(is_archived);
CREATE INDEX idx_repos_first_seen ON repositories(first_seen_at DESC);
CREATE INDEX idx_repos_new_release ON repositories(has_new_release) WHERE has_new_release = TRUE;
```

### Removed tables/columns from old design:
- ❌ `rank_daily`, `rank_weekly`, `rank_monthly` → replaced by single `trending_rank`
- ❌ `domains[]` → removed (no AI classification during scrape)
- ❌ `is_applied` → removed (not useful)
- ❌ `is_viewed`, `viewed_at` → removed (over-engineering)
- ❌ `notes` → removed (YAGNI for v1)
- ❌ `last_release_checked_at` → replaced by `latest_release_tag` + `has_new_release`
- ❌ `last_ranked_at` → removed (no re-ranking)
- ❌ `repo_releases` table → **entirely removed** (we only track latest tag, not full release history)
- ❌ `sync_logs` table → removed (Hermes has its own logs)

### AI Summary Format Decision

**Format:** Markdown (stored as raw text in `ai_summary` column)

**Rendering stack (frontend):**
- `react-markdown` — renders markdown to React components
- `remark-gfm` — GitHub Flavored Markdown (tables, task lists, strikethrough, autolinks)
- `rehype-highlight` — syntax highlighting for code blocks
- Custom Mermaid component — renders `mermaid` fenced code blocks as diagrams client-side

**Why Markdown over HTML:**
- AI can generate it naturally without worrying about design system CSS classes
- Portable — same content works if we change frontend frameworks
- Easy to style — wrap in a `.prose` container with Tailwind Typography plugin
- Supports all needed elements: tables, code blocks, lists, headings, diagrams (via mermaid)

### `sync_logs` — kept minimal

```sql
CREATE TABLE sync_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repos_scraped   INTEGER DEFAULT 0,
    repos_new       INTEGER DEFAULT 0,
    status          TEXT DEFAULT 'running',
    error_message   TEXT,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);
```

---

## API Routes (Simplified)

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/repos` | GET | — | List repos (filters: `tab=all\|favorites\|archived`, `page`, `limit`) |
| `/api/repos/{fullName}` | GET | — | Repo detail |
| `/api/repos/{fullName}` | PATCH | — | Toggle favorite/archive/has_new_release |
| `/api/repos/{fullName}/analyze` | POST | — | Trigger AI analysis (Magic button) |
| `/api/repos/upsert` | POST | `x-api-key` | Batch upsert from Hermes trending sync |
| `/api/repos/check-releases` | POST | `x-api-key` | Batch update release tags for favorite repos (from Hermes cron) |
| `/api/sync` | GET | — | Latest sync log |

### Removed endpoints:
- ❌ `/api/releases` — no full release data storage
- ❌ `/api/releases/upsert` — no full release data storage

---

## Routes (Simplified)

```
/                       → Portfolio (SSG) — unchanged
/tech                   → Dashboard (trending repos list)
/tech/favorites         → Redirect to /tech?tab=favorites (or just tab state)
/tech/[owner]/[repo]    → Repo detail + Magic Analyze
```

### Removed routes:
- ❌ `/tech/trending` — no separate trending page, `/tech` IS the trending page
- ❌ `/tech/releases` — no release feed
- ❌ `/tech/[repo]` — changed to `/tech/[owner]/[repo]` for cleaner URL

---

## Hermes Cron Prompts (for Hermes Cron Page)

The user already has the Hermes Cron page UI. Two cron jobs are needed:

### Cron #1: Weekly Trending Sync (`0 8,20 * * *`)

```
Scrape the first page of https://github.com/trending?since=weekly
For each repository listed, extract: full_name, description, html_url, language, avatar_url, stars_total, stars_growth, forks_total, and its position as trending_rank.
POST the results to https://api.thangvq95.page/api/repos/upsert with header x-api-key: <SYNC_API_KEY>
Body format: { "repositories": [...] }
```

### Cron #2: Favorite Release Monitor (`0 10 * * *`)

```
1. GET https://api.thangvq95.page/api/repos?tab=favorites&limit=100 to get all favorite repos.
2. For each repo, call GitHub API: GET https://api.github.com/repos/{full_name}/releases/latest
3. Collect results: [{ full_name, latest_release_tag (from response tag_name) }]
   Skip any repo where GitHub returns 404 (no releases).
4. POST the results to https://api.thangvq95.page/api/repos/check-releases 
   with header x-api-key: <SYNC_API_KEY>
   Body: { "releases": [{ "full_name": "...", "tag_name": "..." }] }
```

---

## What's NOT Changing

- Portfolio page (`/`) — untouched
- NestJS + PostgreSQL + Docker architecture — same
- Vercel frontend — same
- Hermes agent infrastructure — same
- Design system (Liquid Glass) — same

---

## Migration Notes

- Drop `repo_releases` table (if exists)
- Simplify `repositories` table: drop old columns, add new ones (`latest_release_tag`, `has_new_release`)
- Drop `releases` NestJS module
- Simplify `repos` module (remove rank reset logic, simplify upsert)
- Add `analyze` endpoint + `check-releases` endpoint
- Simplify frontend: remove FilterBar complexity, remove ReleaseCard/ReleaseFeed
- Install frontend markdown rendering: `react-markdown`, `remark-gfm`, `rehype-highlight`
- Add Tailwind Typography plugin (`@tailwindcss/typography`) for `.prose` styling
