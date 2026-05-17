# Stack Page + Remotion Videos — Design Spec

> **Date:** 2026-05-14
> **Status:** Approved (Shipped)
> **Type:** Brainstorm / RFC
> **Scope:** New `/stack` page showcasing tech stack, architecture, and workflows with Remotion animated videos

---

## Context & Motivation

ThangVQ Digital Hub has two routes: `/` (Portfolio) and `/tech` (TechTrend Dashboard). But there's no page that shows **how the platform itself is built** — the full tech stack, autonomous AI workflows, CI/CD pipeline, infrastructure, and data flows.

**Goal:** Create a `/stack` page that serves as **living, animated technical documentation**. Any developer looking at it instantly understands the entire system — frontend, backend, Hermes Agent, GitNexus, VPS + Docker, 9Router, Cloudflare Tunnel, Vercel, CI/CD, Sentry, and more.

**Innovation:** Use [Remotion](https://remotion.dev/) to create programmatic React-based animated videos embedded inline via `@remotion/player`. Videos render as React components directly in the browser — no MP4 files, no heavy builds.

---

## Design Decisions

### 1. Route: `/stack`

- Clean, memorable URL
- Accessible from main nav (portfolio nav bar)
- Alternative considered: `/architecture`, `/how-it-works` — rejected for being too long

### 2. Remotion Player (not pre-rendered MP4)

- **Chosen:** `@remotion/player` — compositions render as React components in-browser
- **Why:** Lightweight, interactive (pause/scrub), no build step, fits "living docs" concept
- **Trade-off:** Requires client-side React rendering. But compositions are small (SVG + text animations), so performance impact is minimal
- **Fallback:** For mobile/low-power devices, compositions can be lazy-loaded with intersection observer

### 3. Project Structure

- Remotion compositions live inside the Next.js project (NOT a separate workspace)
- Path: `remotion/` at repo root for compositions + shared components
- `@remotion/player` imported in Next.js `components/stack/` via `"use client"` wrapper
- `@remotion/cli` (devDependency) provides Remotion Studio for preview during development

### 4. Design System Compliance

- All videos use **Liquid Glass** design tokens from `design-system/MASTER.md`
- Background: `#0F172A`, Accent: `#22C55E`, Text: `#F8FAFC`
- Typography: Space Grotesk (headings) + DM Sans (body)
- Glass-morphism card effects, green pulse animations, smooth SVG path drawing

---

## Page Structure

### Hero Section

```
"How This Was Built"
Subtitle: "A Developer Intelligence Platform built with AI-first autonomous workflows"
[▶ Watch Architecture Overview — 45s]  ← Remotion Player, auto-plays on scroll
```

### Section 1: Tech Stack Grid

Interactive card grid showing every technology used. Cards organized by category with SVG icons.

| Category            | Technologies                                                                |
| ------------------- | --------------------------------------------------------------------------- |
| **Frontend**        | Next.js 16, React, TypeScript, Tailwind CSS v4, ShadcnUI                    |
| **Backend**         | NestJS, TypeORM, PostgreSQL 16                                              |
| **Infrastructure**  | Docker, Docker Compose, DigitalOcean VPS, Vercel, Cloudflare (WAF + Tunnel) |
| **AI & Automation** | Hermes Agent, GitNexus, 9Router, Superpowers Skills, Remotion               |
| **CI/CD**           | GitHub Actions, Husky, release-please, Conventional Commits, Playwright     |
| **Observability**   | Sentry, GitHub Issues, GitHub Projects                                      |

Each card: icon + name + role. Click to expand: version, why chosen, external link.

### Section 2: Architecture Overview (+ Remotion Video #1)

**Remotion Video (45s, 30fps = 1350 frames):**

| Time   | Animation                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------ |
| 0-5s   | Title card "ThangVQ Digital Hub — Architecture" fades in                                         |
| 5-15s  | User icon → arrow to Cloudflare shield → arrow to Vercel → "Frontend: Next.js 16" text           |
| 15-25s | Arrow to NestJS API → PostgreSQL cylinder → Docker outline wraps both → "Backend: Docker on VPS" |
| 25-35s | Hermes Agent box appears → arrows to GitHub (sync) and 9Router (LLM) → GitNexus brain connects   |
| 35-45s | Full diagram visible, lines pulse green, "100% Autonomous" badge                                 |

**Static content below:** Expandable Docker Compose services breakdown (4 containers: postgres, api, hermes-gateway, cloudflared)

### Section 3: AI & Autonomous Workflows (+ Remotion Video #2)

**Remotion Video (40s) — "Hermes Agent Lifecycle":**

| Time   | Animation                                                             |
| ------ | --------------------------------------------------------------------- |
| 0-5s   | Title "Hermes — Autonomous AI Agent"                                  |
| 5-15s  | GitHub polling → SQLite dedup                                         |
| 15-25s | Git worktree branch → Hermes coding → Playwright tests → green checks |
| 25-35s | `git push` → PR card → "Auto-fix complete"                            |
| 35-40s | Cronjob clocks: "8AM/8PM Trending Sync" + "10AM Release Monitor"      |

**Static content:** Cards for Hermes, GitNexus, 9Router, Superpowers Skills with role descriptions

### Section 4: CI/CD & Release Pipeline (+ Remotion Video #3)

**Remotion Video (35s) — "From Commit to Production":**

| Time   | Animation                                                                    |
| ------ | ---------------------------------------------------------------------------- |
| 0-5s   | Title "CI/CD Pipeline"                                                       |
| 5-12s  | Developer types → Husky catches → lint-staged → Conventional Commit format   |
| 12-20s | `develop` branch → PR to `main` → GitHub Actions spins                       |
| 20-28s | "Backend Deploy (SSH → VPS)" → "Health Check ✓" → "Frontend Deploy (Vercel)" |
| 28-35s | release-please bot → version bump → GitHub Release `v1.x.x` → CHANGELOG      |

**Static content:** Cards for GitHub Actions, Husky, release-please, Conventional Commits, Playwright

### Section 5: Data Flows (+ Remotion Video #4)

**Remotion Video (40s) — Dual-lane "Data Pipelines":**

| Time   | Animation                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------- |
| 0-5s   | Split title "Data Pipelines"                                                                                              |
| 5-20s  | **Left lane:** Clock "8AM" → Hermes scrapes Trending → repos flow into upsert API → DB → Dashboard "NEW" badges           |
| 20-35s | **Right lane:** Clock "10AM" → Favorite repos → GitHub Releases API check → tag compare → `has_new_release` → badge glows |
| 35-40s | Both lanes merge into polished TechTrend dashboard view                                                                   |

### Section 6: Observability & Error Recovery (+ Remotion Video #5)

**Remotion Video (30s) — "Self-Healing":**

| Time   | Animation                                                         |
| ------ | ----------------------------------------------------------------- |
| 0-5s   | Title "Self-Healing — Error to Fix in Minutes"                    |
| 5-12s  | Red error burst → Sentry catches → webhook fires                  |
| 12-20s | NestJS handler → auto-creates GitHub Issue with stack trace       |
| 20-27s | Hermes picks up → GitNexus locates code → fix → Playwright passes |
| 27-30s | PR merged → issue closed → green cascade                          |

**Visual style:** Red-to-green gradient transition

---

## Remotion Composition Architecture

### Shared Components (reusable across all 5 videos)

| Component        | Purpose                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `GlassCard`      | Glassmorphism card with backdrop-blur, used for tech nodes            |
| `AnimatedArrow`  | SVG path that draws itself from point A to B with customizable timing |
| `PulseEffect`    | Green glow pulse animation for connection lines                       |
| `TechIcon`       | Renders technology logos/icons (SVG) at specified positions           |
| `TimelineStep`   | Horizontal step indicator for pipeline animations                     |
| `TypewriterText` | Text that types itself character by character                         |
| `FadeIn`         | Wrapper for opacity + translateY entrance animation                   |

### File Structure

```
remotion/
├── compositions/
│   ├── ArchitectureOverview.tsx    # Video 1
│   ├── HermesLifecycle.tsx         # Video 2
│   ├── CICDPipeline.tsx           # Video 3
│   ├── DataPipelines.tsx          # Video 4
│   └── SentryAutoFix.tsx          # Video 5
├── components/
│   ├── AnimatedArrow.tsx
│   ├── GlassCard.tsx
│   ├── PulseEffect.tsx
│   ├── TechIcon.tsx
│   ├── TimelineStep.tsx
│   ├── TypewriterText.tsx
│   └── FadeIn.tsx
├── lib/
│   ├── constants.ts               # Colors, fonts, dimensions from design system
│   └── animations.ts              # Shared interpolation/easing helpers
├── Root.tsx                        # Composition registry (for Remotion Studio)
└── index.ts                        # Barrel exports
```

### Next.js Integration

```
app/stack/
├── page.tsx                        # Server Component — page layout + static content

components/stack/
├── RemotionPlayerWrapper.tsx       # "use client" — wraps @remotion/player <Player>
├── TechCard.tsx                    # Technology card (icon + name + role + expand)
├── SectionBlock.tsx                # Reusable section layout (video + cards)
└── TechStackGrid.tsx               # Grid of TechCards by category

lib/
└── stack-data.ts                   # Static data for all technologies
```

---

## Data Model

### `lib/stack-data.ts`

```typescript
interface TechItem {
  name: string;
  icon: string; // Simple Icons slug or Lucide icon name
  role: string; // One-line description
  category:
    | "frontend"
    | "backend"
    | "infrastructure"
    | "ai"
    | "cicd"
    | "observability";
  url: string; // External link
  version?: string; // e.g., "16", "v4"
  why?: string; // Why this technology was chosen (expandable)
}
```

No database changes needed. All data is static/hardcoded.

---

## Responsive Design

| Breakpoint           | Layout                                               |
| -------------------- | ---------------------------------------------------- |
| **Mobile (375px)**   | Video full-width, cards 1-column, videos lazy-loaded |
| **Tablet (768px)**   | Video full-width, cards 2-column grid                |
| **Desktop (1024px)** | Side-by-side: video left (60%) + cards right (40%)   |
| **Wide (1440px)**    | Centered max-width container, same as 1024 layout    |

Mobile optimization: Remotion Player loads only when scrolled into view (Intersection Observer + `React.lazy`).

---

## What's NOT in Scope

- ❌ Pre-rendering videos to MP4 (can add later)
- ❌ Backend API changes (all data is static)
- ❌ Database schema changes
- ❌ Voiceover / audio in videos (pure visual animations)
- ❌ Video download functionality
- ❌ CMS for editing tech stack data (hardcoded is fine)

---

## Dependencies Added

| Package            | Type          | Purpose                                     |
| ------------------ | ------------- | ------------------------------------------- |
| `remotion`         | production    | Core Remotion framework                     |
| `@remotion/player` | production    | Embed compositions as `<Player>` in Next.js |
| `@remotion/cli`    | devDependency | Remotion Studio for development preview     |

Already installed by user on 2026-05-14.

---

## Migration Notes

- New route `/stack` — no existing routes affected
- New `remotion/` directory — no conflicts with existing code
- New `components/stack/` — follows existing pattern (`components/portfolio/`, `components/dashboard/`)
- `@remotion/player` requires `"use client"` directive (consistent with existing dashboard pattern)
