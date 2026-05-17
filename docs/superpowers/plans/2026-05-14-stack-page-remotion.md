# Stack Page + Remotion Videos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a `/stack` page showcasing the full ThangVQ Digital Hub tech stack with 5 inline Remotion animated videos.

**Architecture:** Remotion compositions live in `remotion/` at repo root. `@remotion/player` embeds them as React components in `app/stack/`. All data is static in `lib/stack-data.ts`. No DB or API changes needed.

**Tech Stack:** Next.js 16 App Router, Tailwind v4, ShadcnUI, Remotion 4, @remotion/player, TypeScript

---

## Task 1: Branch + Static Data

**Files:**

- Create: `lib/stack-data.ts`

- [x] **Step 1: Create feature branch**

```bash
git checkout -b feat/stack-page
```

- [x] **Step 2: Create `lib/stack-data.ts`**

```ts
export interface TechItem {
  name: string;
  icon: string;
  role: string;
  category:
    | "frontend"
    | "backend"
    | "infrastructure"
    | "ai"
    | "cicd"
    | "observability";
  url: string;
  version?: string;
  why?: string;
}

export const techStack: Record<string, TechItem[]> = {
  frontend: [
    {
      name: "Next.js 16",
      icon: "nextdotjs",
      role: "App Router — SSR/SSG + RSC",
      category: "frontend",
      url: "https://nextjs.org",
      version: "16",
      why: "SSG for Portfolio SEO, RSC for Dashboard performance",
    },
    {
      name: "React",
      icon: "react",
      role: "UI Framework",
      category: "frontend",
      url: "https://react.dev",
      version: "19",
    },
    {
      name: "TypeScript",
      icon: "typescript",
      role: "Type Safety",
      category: "frontend",
      url: "https://www.typescriptlang.org",
    },
    {
      name: "Tailwind CSS v4",
      icon: "tailwindcss",
      role: "Utility-first styling",
      category: "frontend",
      url: "https://tailwindcss.com",
      version: "4",
      why: "Rapid UI, token-based design system, Tailwind v4 @theme",
    },
    {
      name: "ShadcnUI",
      icon: "shadcnui",
      role: "Component library",
      category: "frontend",
      url: "https://ui.shadcn.com",
      why: "Accessible, unstyled components — full design control",
    },
    {
      name: "Remotion",
      icon: "remotion",
      role: "Programmatic video creation",
      category: "frontend",
      url: "https://remotion.dev",
      version: "4",
      why: "React-based video compositions embedded via @remotion/player",
    },
  ],
  backend: [
    {
      name: "NestJS",
      icon: "nestjs",
      role: "API framework",
      category: "backend",
      url: "https://nestjs.com",
      why: "Modular, decorator-based — perfect for Hermes/frontend access",
    },
    {
      name: "PostgreSQL 16",
      icon: "postgresql",
      role: "Primary database",
      category: "backend",
      url: "https://postgresql.org",
      version: "16",
    },
    {
      name: "TypeORM",
      icon: "typeorm",
      role: "ORM + migrations",
      category: "backend",
      url: "https://typeorm.io",
    },
    {
      name: "Node.js",
      icon: "nodedotjs",
      role: "Runtime",
      category: "backend",
      url: "https://nodejs.org",
      version: "20 LTS",
    },
  ],
  infrastructure: [
    {
      name: "Docker",
      icon: "docker",
      role: "Containerization",
      category: "infrastructure",
      url: "https://docker.com",
      why: "5 containers: postgres, api, hermes-gateway, cloudflared",
    },
    {
      name: "DigitalOcean VPS",
      icon: "digitalocean",
      role: "Backend + AI hosting",
      category: "infrastructure",
      url: "https://digitalocean.com",
      why: "Self-hosted for direct Hermes access, no cold starts",
    },
    {
      name: "Vercel",
      icon: "vercel",
      role: "Frontend hosting (edge)",
      category: "infrastructure",
      url: "https://vercel.com",
      why: "SSG/ISR, global CDN, zero-config Next.js deploy",
    },
    {
      name: "Cloudflare",
      icon: "cloudflare",
      role: "WAF + DNS + Tunnel",
      category: "infrastructure",
      url: "https://cloudflare.com",
      why: "DDoS protection, DNS proxy, secure tunnels (no open ports)",
    },
    {
      name: "Docker Compose",
      icon: "docker",
      role: "Multi-container orchestration",
      category: "infrastructure",
      url: "https://docs.docker.com/compose",
    },
  ],
  ai: [
    {
      name: "Hermes Agent",
      icon: "robot",
      role: "Autonomous AI worker on VPS",
      category: "ai",
      url: "https://hermes.ai",
      why: "Runs cronjobs, writes code, fixes PRs, manages task state autonomously",
    },
    {
      name: "GitNexus",
      icon: "git",
      role: "Code knowledge graph (MCP)",
      category: "ai",
      url: "https://gitnexus.dev",
      why: "Provides unified codebase context to all agents via MCP server",
    },
    {
      name: "9Router",
      icon: "route",
      role: "Centralized LLM API Gateway",
      category: "ai",
      url: "https://9router.phieucaphe.com",
      why: "Single gateway for all LLM calls — no local LLMs on VPS",
    },
    {
      name: "Superpowers Skills",
      icon: "zap",
      role: "AI workflow skills (brainstorming, TDD, etc.)",
      category: "ai",
      url: "https://skills.sh",
      why: "Offline-available skills committed to .agents/skills/",
    },
    {
      name: "Playwright",
      icon: "playwright",
      role: "E2E + API testing automation",
      category: "ai",
      url: "https://playwright.dev",
      why: "TDD — no code ships without passing Playwright tests",
    },
  ],
  cicd: [
    {
      name: "GitHub Actions",
      icon: "githubactions",
      role: "CI/CD orchestration",
      category: "cicd",
      url: "https://github.com/features/actions",
      why: "Backend-first deploy: SSH → VPS → health check → Vercel hook",
    },
    {
      name: "Husky",
      icon: "git",
      role: "Git hooks (pre-commit)",
      category: "cicd",
      url: "https://typicode.github.io/husky",
      why: "Enforces lint-staged + commitlint on every commit",
    },
    {
      name: "release-please",
      icon: "tag",
      role: "Automated semantic versioning",
      category: "cicd",
      url: "https://github.com/googleapis/release-please",
      why: "Auto-generates CHANGELOG + version bumps from Conventional Commits",
    },
    {
      name: "Conventional Commits",
      icon: "gitcommit",
      role: "Commit message standard",
      category: "cicd",
      url: "https://conventionalcommits.org",
      why: "Required for release-please to calculate semver correctly",
    },
  ],
  observability: [
    {
      name: "Sentry",
      icon: "sentry",
      role: "Error tracking + alerting",
      category: "observability",
      url: "https://sentry.io",
      why: "Captures unhandled errors → auto-creates GitHub Issues via webhook",
    },
    {
      name: "GitHub Issues",
      icon: "github",
      role: "Task orchestrator",
      category: "observability",
      url: "https://github.com",
      why: "Single source of truth for all tasks — Hermes reads + updates them",
    },
    {
      name: "GitHub Projects",
      icon: "github",
      role: "Kanban board",
      category: "observability",
      url: "https://github.com",
      why: "Visual task management — To-do / In Progress / Done",
    },
  ],
};

export const categoryMeta: Record<
  string,
  { label: string; description: string; color: string }
> = {
  frontend: {
    label: "Frontend",
    description: "UI, rendering, and browser-side logic",
    color: "#60A5FA",
  },
  backend: {
    label: "Backend",
    description: "API, database, and server-side processing",
    color: "#34D399",
  },
  infrastructure: {
    label: "Infrastructure",
    description: "Hosting, networking, and containerization",
    color: "#F59E0B",
  },
  ai: {
    label: "AI & Automation",
    description: "Autonomous agents, LLMs, and intelligent workflows",
    color: "#A78BFA",
  },
  cicd: {
    label: "CI/CD",
    description: "Automated testing, releases, and deployments",
    color: "#F472B6",
  },
  observability: {
    label: "Observability",
    description: "Error tracking, task management, and monitoring",
    color: "#FB923C",
  },
};
```

- [x] **Step 3: Commit**

```bash
git add lib/stack-data.ts
git commit -m "feat(stack): add static tech stack data"
```

---

## Task 2: Remotion Shared Components

**Files:**

- Create: `remotion/lib/constants.ts`
- Create: `remotion/components/FadeIn.tsx`
- Create: `remotion/components/GlassCard.tsx`
- Create: `remotion/components/AnimatedArrow.tsx`
- Create: `remotion/components/PulseEffect.tsx`
- Create: `remotion/components/TypewriterText.tsx`
- Create: `remotion/components/TimelineStep.tsx`

- [x] **Step 1: Create `remotion/lib/constants.ts`**

```ts
export const COLORS = {
  bg: "#0F172A",
  card: "#1E293B",
  cardHover: "#334155",
  accent: "#22C55E",
  accentGlow: "rgba(34,197,94,0.15)",
  accentGlowStrong: "rgba(34,197,94,0.3)",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  border: "#334155",
  red: "#EF4444",
  blue: "#60A5FA",
  purple: "#A78BFA",
} as const;

export const FONTS = {
  heading: "Space Grotesk, system-ui, sans-serif",
  body: "DM Sans, system-ui, sans-serif",
} as const;

export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const FPS = 30;
```

- [x] **Step 2: Create `remotion/components/FadeIn.tsx`**

```tsx
import { interpolate, useCurrentFrame, Easing } from "remotion";
import React from "react";

interface FadeInProps {
  children: React.ReactNode;
  from?: number; // start frame
  durationFrames?: number;
  translateY?: number;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  from = 0,
  durationFrames = 20,
  translateY = 16,
  style,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - from;

  const opacity = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const y = interpolate(localFrame, [0, durationFrames], [translateY, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  if (localFrame < 0) return null;

  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>
      {children}
    </div>
  );
};
```

- [x] **Step 3: Create `remotion/components/GlassCard.tsx`**

```tsx
import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { COLORS } from "../lib/constants";

interface GlassCardProps {
  children: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  appearFrame?: number;
  accentColor?: string;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  x,
  y,
  width,
  height,
  appearFrame = 0,
  accentColor = COLORS.accent,
  style,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - appearFrame;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const scale = interpolate(localFrame, [0, 15], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

  if (localFrame < 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        background: `rgba(30,41,59,0.85)`,
        border: `1px solid ${accentColor}40`,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `scale(${scale})`,
        boxShadow: `0 0 20px ${accentColor}20`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
```

- [x] **Step 4: Create `remotion/components/AnimatedArrow.tsx`**

```tsx
import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { COLORS } from "../lib/constants";

interface Point {
  x: number;
  y: number;
}

interface AnimatedArrowProps {
  from: Point;
  to: Point;
  appearFrame?: number;
  durationFrames?: number;
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
}

export const AnimatedArrow: React.FC<AnimatedArrowProps> = ({
  from,
  to,
  appearFrame = 0,
  durationFrames = 20,
  color = COLORS.accent,
  strokeWidth = 2,
  dashed = false,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - appearFrame;

  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  if (localFrame < 0) return null;

  const cx = from.x + (to.x - from.x) * progress;
  const cy = from.y + (to.y - from.y) * progress;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const arrowSize = 8;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <line
        x1={from.x}
        y1={from.y}
        x2={cx}
        y2={cy}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? "6 4" : undefined}
        strokeLinecap="round"
      />
      {progress > 0.9 && (
        <polygon
          points={`0,-${arrowSize / 2} ${arrowSize},0 0,${arrowSize / 2}`}
          fill={color}
          transform={`translate(${cx},${cy}) rotate(${angle})`}
        />
      )}
    </svg>
  );
};
```

- [x] **Step 5: Create `remotion/components/PulseEffect.tsx`**

```tsx
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../lib/constants";

interface PulseEffectProps {
  x: number;
  y: number;
  radius?: number;
  color?: string;
  startFrame?: number;
}

export const PulseEffect: React.FC<PulseEffectProps> = ({
  x,
  y,
  radius = 20,
  color = COLORS.accent,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const localFrame = (frame - startFrame) % 60;
  if (frame < startFrame) return null;

  const scale = interpolate(localFrame, [0, 60], [0.5, 2.5], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(localFrame, [0, 60], [0.7, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <circle
        cx={x}
        cy={y}
        r={radius * scale}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={opacity}
      />
      <circle cx={x} cy={y} r={radius * 0.4} fill={color} opacity={0.9} />
    </svg>
  );
};
```

- [x] **Step 6: Create `remotion/components/TypewriterText.tsx`**

```tsx
import React from "react";
import { useCurrentFrame } from "remotion";

interface TypewriterTextProps {
  text: string;
  startFrame?: number;
  charsPerFrame?: number;
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  charsPerFrame = 0.5,
  style,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;
  const charsToShow = Math.min(
    Math.floor(localFrame * charsPerFrame),
    text.length,
  );
  return <span style={style}>{text.slice(0, charsToShow)}</span>;
};
```

- [x] **Step 7: Create `remotion/components/TimelineStep.tsx`**

```tsx
import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { COLORS, FONTS } from "../lib/constants";

interface TimelineStepProps {
  label: string;
  x: number;
  y: number;
  appearFrame?: number;
  active?: boolean;
  color?: string;
  index?: number;
}

export const TimelineStep: React.FC<TimelineStepProps> = ({
  label,
  x,
  y,
  appearFrame = 0,
  active = false,
  color = COLORS.accent,
  index = 0,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - appearFrame;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: active ? color : COLORS.card,
          border: `2px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: active ? "#000" : color,
          fontFamily: FONTS.heading,
          fontWeight: 700,
          fontSize: 14,
          boxShadow: active ? `0 0 16px ${color}60` : "none",
        }}
      >
        {index + 1}
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 11,
          color: COLORS.textSecondary,
          textAlign: "center",
          maxWidth: 80,
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
    </div>
  );
};
```

- [x] **Step 8: Commit**

```bash
git add remotion/
git commit -m "feat(stack): add Remotion shared components and constants"
```

---

## Task 3: Video 1 — Architecture Overview

**Files:**

- Create: `remotion/compositions/ArchitectureOverview.tsx`
- Create: `remotion/Root.tsx`

- [x] **Step 1: Create `remotion/compositions/ArchitectureOverview.tsx`**

(Full composition — see implementation below)

- [x] **Step 2: Create `remotion/Root.tsx`** (Remotion Studio registry)

- [x] **Step 3: Commit**

```bash
git add remotion/
git commit -m "feat(stack): add Architecture Overview Remotion composition"
```

---

## Task 4: Videos 2–5 (Hermes, CI/CD, Data Pipelines, Sentry)

**Files:**

- Create: `remotion/compositions/HermesLifecycle.tsx`
- Create: `remotion/compositions/CICDPipeline.tsx`
- Create: `remotion/compositions/DataPipelines.tsx`
- Create: `remotion/compositions/SentryAutoFix.tsx`

- [x] **Step 1: Implement all 4 remaining compositions**
- [x] **Step 2: Register all in `remotion/Root.tsx`**
- [x] **Step 3: Commit**

```bash
git commit -m "feat(stack): add Hermes, CI/CD, Data Pipelines, Sentry Remotion compositions"
```

---

## Task 5: Next.js Stack Page Components

**Files:**

- Create: `components/stack/RemotionPlayerWrapper.tsx`
- Create: `components/stack/TechCard.tsx`
- Create: `components/stack/TechStackGrid.tsx`
- Create: `components/stack/SectionBlock.tsx`
- Create: `components/stack/StackHero.tsx`

- [x] **Step 1: Create all components**
- [x] **Step 2: Create `app/stack/page.tsx`**
- [x] **Step 3: Commit**

```bash
git commit -m "feat(stack): add /stack page with tech grid and Remotion player"
```

---

## Task 6: Verify + PR

- [x] **Step 1: Run lint + build**

```bash
npm run lint && npm run build
```

- [x] **Step 2: Verify in dev server** (`npm run dev` → http://localhost:3000/stack)
- [x] **Step 3: Create PR**

```bash
gh pr create --fill
```
