# TechTrend Dashboard Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the TechTrend dashboard (`/tech`) to the NestJS API, implementing filtering, favorites, repo detail page, and release feed.

**Architecture:** Next.js 16 App Router. Server Components for initial data fetch. Client Components only for interactive filters and toggles. API calls go to `NEXT_PUBLIC_API_URL` (NestJS backend). Existing skeleton components in `components/dashboard/` get upgraded.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Lucide React, Playwright

**Prerequisite:** Plan `2026-05-07-backend-api.md` must be completed first (NestJS API running).

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `lib/api/client.ts` | API client (fetch wrapper) |
| Modify | `lib/api/types.ts` | Add Release, SyncLog, API response types |
| Modify | `components/dashboard/FilterBar.tsx` | Period/domain/fav filters (client) |
| Modify | `components/dashboard/StatsBar.tsx` | Sync status display |
| Modify | `components/dashboard/RepoCard.tsx` | Optimistic PATCH for fav/applied |
| Modify | `components/dashboard/RepoGrid.tsx` | Fetch + render repo list |
| Modify | `components/dashboard/DashboardHeader.tsx` | Wire search input |
| Create | `app/tech/[repo]/page.tsx` | Repo detail + releases page |
| Create | `app/tech/releases/page.tsx` | Release feed page |
| Create | `components/dashboard/ReleaseCard.tsx` | Release card with AI summary |
| Create | `tests/dashboard.spec.ts` | E2E tests |

---

### Task 1: API Client + Extended Types

- [ ] **Step 1: Create API client**

```ts
// lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const api = {
  repos: {
    list: (params?: URLSearchParams) =>
      apiFetch<{ data: import('./types').Repository[]; meta: { total: number; period: string } }>(
        `/api/repos${params ? `?${params}` : ''}`
      ),
    detail: (fullName: string) =>
      apiFetch<import('./types').Repository>(`/api/repos/${encodeURIComponent(fullName)}`),
    patch: (fullName: string, body: Record<string, unknown>) =>
      apiFetch<import('./types').Repository>(`/api/repos/${encodeURIComponent(fullName)}`, {
        method: 'PATCH', body: JSON.stringify(body),
      }),
  },
  releases: {
    list: (page = 1, limit = 20) =>
      apiFetch<{ data: import('./types').RepoRelease[]; meta: { total: number } }>(
        `/api/releases?page=${page}&limit=${limit}`
      ),
  },
  sync: {
    latest: () => apiFetch<import('./types').SyncLog | null>('/api/sync'),
  },
};
```

- [ ] **Step 2: Extend types**

```ts
// lib/api/types.ts
export interface Repository {
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  avatar_url: string | null;
  rank_daily: number | null;
  rank_weekly: number | null;
  rank_monthly: number | null;
  stars_total: number;
  stars_growth: string | null;
  forks_total: number;
  domains: string[];
  is_favorite: boolean;
  is_applied: boolean;
  is_viewed: boolean;
  notes: string | null;
  first_seen_at: string;
  last_ranked_at: string | null;
  updated_at: string;
}

export interface RepoRelease {
  id: string;
  repo_full_name: string;
  release_tag: string;
  release_title: string | null;
  release_url: string | null;
  published_at: string | null;
  ai_summary: string | null;
  breaking_changes: string | null;
  migration_notes: string | null;
  relevance_score: number | null;
  is_viewed: boolean;
  processed_at: string;
}

export interface SyncLog {
  id: string;
  sync_type: string;
  repos_scraped: number;
  repos_new: number;
  repos_classified: number;
  status: string;
  started_at: string;
  completed_at: string | null;
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/api/
git commit -m "feat(dashboard): add API client + extended types for repos, releases, sync"
```

---

### Task 2: Dashboard E2E Tests

- [ ] **Step 1: Write dashboard tests**

```ts
// tests/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('TechTrend Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tech');
  });

  test('renders dashboard header with search', async ({ page }) => {
    await expect(page.locator('#dashboard-header')).toBeVisible();
    await expect(page.locator('#dashboard-search-input')).toBeVisible();
  });

  test('renders filter bar with period tabs', async ({ page }) => {
    await expect(page.locator('#filter-bar')).toBeVisible();
    await expect(page.locator('#filter-period-daily')).toBeVisible();
  });

  test('renders repo grid container', async ({ page }) => {
    await expect(page.locator('#repo-grid')).toBeVisible();
  });

  test('renders stats bar with sync info', async ({ page }) => {
    await expect(page.locator('#stats-bar')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run tests (red)**

Run: `npx playwright test tests/dashboard.spec.ts --project=chromium`
Expected: FAIL — missing IDs on filter bar, stats bar, repo grid.

- [ ] **Step 3: Commit**

```bash
git add tests/dashboard.spec.ts
git commit -m "test: add TechTrend dashboard E2E tests"
```

---

### Task 3: FilterBar Client Component

- [ ] **Step 1: Implement FilterBar with period/domain/fav tabs**

```tsx
// components/dashboard/FilterBar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DOMAINS } from "@/lib/constants";

const PERIODS = ["daily", "weekly", "monthly"] as const;

const FilterBar: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") ?? "daily";
  const currentDomain = searchParams.get("domain") ?? "";
  const currentFav = searchParams.get("fav") === "true";

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/tech?${params.toString()}`);
  };

  return (
    <div id="filter-bar" className="flex flex-wrap items-center gap-3">
      {/* Period tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--bg-card)" }}>
        {PERIODS.map((p) => (
          <button
            key={p}
            id={`filter-period-${p}`}
            onClick={() => setFilter("period", p)}
            className="px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer"
            style={
              currentPeriod === p
                ? { background: "var(--accent)", color: "#fff" }
                : { color: "var(--text-muted)" }
            }
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Domain dropdown */}
      <select
        id="filter-domain"
        value={currentDomain}
        onChange={(e) => setFilter("domain", e.target.value)}
        className="px-3 py-1.5 text-xs rounded-lg cursor-pointer"
        style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
      >
        <option value="">All Domains</option>
        {DOMAINS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Favorites toggle */}
      <button
        id="filter-fav"
        onClick={() => setFilter("fav", currentFav ? "" : "true")}
        className="px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer"
        style={
          currentFav
            ? { background: "var(--accent)", color: "#fff" }
            : { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
        }
      >
        {currentFav ? "♥ Favorites" : "♡ Favorites"}
      </button>
    </div>
  );
};

export default FilterBar;
```

- [ ] **Step 2: Run filter bar test**

Run: `npx playwright test tests/dashboard.spec.ts -g "renders filter bar" --project=chromium`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/FilterBar.tsx
git commit -m "feat(dashboard): implement FilterBar with period/domain/fav filters"
```

---

### Task 4: RepoGrid with API Fetch + StatsBar

- [ ] **Step 1: Create RepoGridClient (client component that fetches)**

```tsx
// components/dashboard/RepoGrid.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/client";
import type { Repository } from "@/lib/api/types";
import RepoCard from "./RepoCard";

const RepoGrid: React.FC = () => {
  const searchParams = useSearchParams();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    api.repos.list(params)
      .then((res) => setRepos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div id="repo-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
    );
  }

  return (
    <div id="repo-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {repos.length === 0 ? (
        <div className="col-span-full text-center py-16" style={{ color: "var(--text-muted)" }}>
          No repositories found. Waiting for Hermes to sync trending data.
        </div>
      ) : (
        repos.map((repo) => <RepoCard key={repo.full_name} repo={repo} />)
      )}
    </div>
  );
};

export default RepoGrid;
```

- [ ] **Step 2: Update StatsBar**

```tsx
// components/dashboard/StatsBar.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { SyncLog } from "@/lib/api/types";

const StatsBar: React.FC = () => {
  const [sync, setSync] = useState<SyncLog | null>(null);

  useEffect(() => {
    api.sync.latest().then(setSync).catch(console.error);
  }, []);

  const formatTime = (iso: string | null) => {
    if (!iso) return "Never";
    return new Date(iso).toLocaleString();
  };

  return (
    <div
      id="stats-bar"
      className="flex flex-wrap items-center gap-4 text-xs px-4 py-2 rounded-lg"
      style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}
    >
      <span>Last sync: {sync ? formatTime(sync.completed_at ?? sync.started_at) : "Loading..."}</span>
      {sync && <span>Status: {sync.status}</span>}
      {sync && sync.repos_scraped > 0 && <span>{sync.repos_scraped} repos scraped</span>}
    </div>
  );
};

export default StatsBar;
```

- [ ] **Step 3: Update RepoCard with optimistic PATCH**

Replace the TODO in `components/dashboard/RepoCard.tsx` — change the toggle handlers:

```tsx
// In RepoCard.tsx, replace the handleToggle functions:
const handleToggleFavorite = async () => {
  setIsFavorite((v) => !v);
  try {
    await api.repos.patch(repo.full_name, { is_favorite: !isFavorite });
  } catch {
    setIsFavorite((v) => !v); // rollback
  }
};

const handleToggleApplied = async () => {
  setIsApplied((v) => !v);
  try {
    await api.repos.patch(repo.full_name, { is_applied: !isApplied });
  } catch {
    setIsApplied((v) => !v); // rollback
  }
};
```

Add import at top of RepoCard.tsx:
```tsx
import { api } from "@/lib/api/client";
```

- [ ] **Step 4: Run grid + stats tests**

Run: `npx playwright test tests/dashboard.spec.ts --project=chromium`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/
git commit -m "feat(dashboard): wire RepoGrid, StatsBar, RepoCard to NestJS API"
```

---

### Task 5: Repo Detail Page

- [ ] **Step 1: Create repo detail page**

```tsx
// app/tech/[repo]/page.tsx
import { api } from "@/lib/api/client";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ repo: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { repo } = await params;
  return { title: decodeURIComponent(repo) };
}

export default async function RepoDetailPage({ params }: Props) {
  const { repo: encodedRepo } = await params;
  const fullName = decodeURIComponent(encodedRepo);

  let repoData;
  try {
    repoData = await api.repos.detail(fullName);
  } catch {
    notFound();
  }

  if (!repoData) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <a href="/tech" className="text-sm mb-6 inline-block cursor-pointer" style={{ color: "var(--accent)" }}>
        &larr; Back to Dashboard
      </a>

      <div className="p-6 rounded-2xl glass" style={{ border: "1px solid var(--border)" }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          {repoData.full_name}
        </h1>
        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
          {repoData.description ?? "No description"}
        </p>
        <div className="flex gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
          <span>Stars: {repoData.stars_total?.toLocaleString()}</span>
          <span>Language: {repoData.language ?? "—"}</span>
          <span>Forks: {repoData.forks_total?.toLocaleString()}</span>
        </div>
        {repoData.domains?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {repoData.domains.map((d) => (
              <span key={d} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
                {d}
              </span>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/tech/\[repo\]/
git commit -m "feat(dashboard): add repo detail page at /tech/[repo]"
```

---

### Task 6: Release Feed Page

- [ ] **Step 1: Create ReleaseCard component**

```tsx
// components/dashboard/ReleaseCard.tsx
import type { RepoRelease } from "@/lib/api/types";

const ReleaseCard: React.FC<{ release: RepoRelease }> = ({ release }) => {
  const scoreColor =
    (release.relevance_score ?? 0) >= 71 ? "hsl(0, 72%, 51%)" :
    (release.relevance_score ?? 0) >= 31 ? "hsl(45, 93%, 47%)" : "var(--text-muted)";

  return (
    <div className="p-5 rounded-2xl glass card-hover" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {release.repo_full_name}
        </span>
        {release.relevance_score != null && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: scoreColor, color: "#fff" }}>
            {release.relevance_score}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
          {release.release_tag}
        </span>
        {release.published_at && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {new Date(release.published_at).toLocaleDateString()}
          </span>
        )}
      </div>
      {release.ai_summary && (
        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>{release.ai_summary}</p>
      )}
      {release.breaking_changes && (
        <div className="text-xs p-2 rounded-lg mb-2" style={{ background: "hsla(0, 72%, 51%, 0.1)", color: "hsl(0, 72%, 65%)" }}>
          Breaking: {release.breaking_changes}
        </div>
      )}
    </div>
  );
};

export default ReleaseCard;
```

- [ ] **Step 2: Create release feed page**

```tsx
// app/tech/releases/page.tsx
import { api } from "@/lib/api/client";
import ReleaseCard from "@/components/dashboard/ReleaseCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Release Feed",
  description: "AI-analyzed releases from your favorite repositories.",
};

export default async function ReleaseFeedPage() {
  const { data: releases } = await api.releases.list(1, 50);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <a href="/tech" className="text-sm mb-6 inline-block cursor-pointer" style={{ color: "var(--accent)" }}>
        &larr; Back to Dashboard
      </a>
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>Release Feed</h1>
      <div className="space-y-4">
        {releases.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No releases yet. Favorite some repos and Hermes will monitor them.</p>
        ) : (
          releases.map((r) => <ReleaseCard key={r.id} release={r} />)
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/ReleaseCard.tsx app/tech/releases/
git commit -m "feat(dashboard): add release feed page + ReleaseCard component"
```

---

### Task 7: Final Wiring + Nav Links

- [ ] **Step 1: Add nav links to DashboardHeader**

In `components/dashboard/DashboardHeader.tsx`, add links to releases feed in the `<nav>`:

```tsx
// Add inside the <nav> element, before the Portfolio link:
<Link href="/tech/releases" className="text-sm transition-colors hover:underline" style={{ color: "var(--text-secondary)" }}>
  Releases
</Link>
```

- [ ] **Step 2: Add `.env.local` template**

```bash
# .env.local (gitignored)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- [ ] **Step 3: Run full test suite**

Run: `npx playwright test --project=chromium`
Expected: ALL PASS (portfolio + dashboard tests)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(dashboard): complete Phase 1 TechTrend dashboard — filters, grid, detail, releases"
```
