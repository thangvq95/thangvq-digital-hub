# Portfolio Tech Stack & Project Screenshot Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the portfolio and tech dashboard by adding modern tools (GetX, VSCode, Antigravity, Claude Code, 9router), incorporating a live production screenshot in the project details dialog, and pointing ThangVQ Digital Hub directly to `/tech`.

**Architecture:**

1. Update portfolio list schemas and constants (`lib/constants.ts`) to support an optional `image` field and append new tech tools.
2. Extend the complete tech stack database (`lib/stack-data.ts`) to include detailed representations for AI development agents (`Antigravity`, `Claude Code`).
3. Update the UI dialog (`components/portfolio/ProjectDialog.tsx`) to conditionally render the aspect-ratio controlled, bordered screenshot beneath tags when available.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Lucide Icons.

---

### Task 1: Update Constants & Complete Stack Schema

**Files:**

- Modify: `lib/constants.ts`
- Modify: `lib/stack-data.ts`

- [ ] **Step 1: Update `lib/constants.ts`**
      Add the `image` field to `PROJECTS` type, add new tools to `TECH_STACK` ("GetX" to Mobile, and "VSCode", "Antigravity", "Claude Code", "9router" to Tools & APIs), and update the "ThangVQ Digital Hub" project.

  Replace `TECH_STACK` (lines 39-60) and `PROJECTS` (lines 105-152) with:

  ```typescript
  // ─── Portfolio: Tech Stack ────────────────────────────────────────────────────
  export const TECH_STACK: { name: string; items: string[] }[] = [
    {
      name: "Mobile (Primary)",
      items: [
        "Flutter",
        "Dart",
        "Riverpod",
        "Bloc",
        "GetX",
        "Clean Architecture",
      ],
    },
    {
      name: "Mobile (Android)",
      items: ["Kotlin", "Jetpack Compose", "Java", "RxJava"],
    },
    {
      name: "Backend & Infra",
      items: ["Firebase", "SQL", "CI/CD", "Docker", "Cloudflare Tunnels"],
    },
    {
      name: "Tools & APIs",
      items: [
        "Android Studio",
        "VSCode",
        "Figma",
        "Google Maps API",
        "Google Analytics",
        "Antigravity",
        "Claude Code",
        "9router",
      ],
    },
    {
      name: "Workflow",
      items: ["Git", "Design Patterns", "Claude", "Gemini"],
    },
  ];
  ```

  ```typescript
  // ─── Portfolio: Featured Projects ─────────────────────────────────────────────
  export const PROJECTS: {
    title: string;
    description: string;
    tags: string[];
    url?: string;
    /** undefined = no stack page; "" = default (digital hub); "slug" = ?project=slug */
    stackProject?: string | null;
    image?: string;
  }[] = [
    {
      title: "Sổ Giáo Dân",
      description:
        "Full-stack parish management platform with NestJS API, PostgreSQL, and Next.js dashboard.",
      tags: ["NestJS", "Next.js", "PostgreSQL", "Docker"],
      url: "https://sogioadan.com",
      stackProject: "sogiaodan",
    },
    {
      title: "ThangVQ Digital Hub",
      description:
        "Developer intelligence platform with AI-powered trending repo analysis and release monitoring.",
      tags: [
        "Next.js",
        "Tailwind",
        "Hermes",
        "Playwright",
        "VPS Digital Ocean",
        "Cloudflare",
        "Vercel",
        "GitNexus",
      ],
      url: "https://thangvq95.page/tech",
      stackProject: "",
      image: "/screenshots/techtrend.png",
    },
    {
      title: "Care Mobile App",
      description:
        "Production Flutter app serving thousands of users. Built CI/CD pipelines and clean architecture.",
      tags: ["Flutter", "Dart", "Riverpod", "CI/CD"],
      stackProject: "care-health",
    },
    {
      title: "Self-Hosted Infrastructure",
      description:
        "Mac Mini M4 Pro production server running Docker, Cloudflare Tunnels, and autonomous AI agents.",
      tags: ["Docker", "Cloudflare", "GitHub Actions", "Mac Mini"],
      stackProject: null,
    },
  ];
  ```

- [ ] **Step 2: Update `lib/stack-data.ts`**
      Add `Antigravity` and `Claude Code` items to the `ai` stack list.

  Modify `techStack.ai` list (lines 147-188) to:

  ```typescript
    ai: [
      {
        name: "Hermes Agent",
        icon: "robot",
        role: "Autonomous AI worker on VPS",
        category: "ai",
        url: "https://hermes.ai",
        why: "Runs cronjobs, writes code, fixes PRs. Native cron poller + SQLite dedup + git worktrees.",
      },
      {
        name: "Antigravity",
        icon: "robot",
        role: "Agentic AI Developer (Gemini)",
        category: "ai",
        url: "https://github.com/google-gemini",
        why: "A powerful agentic AI coding assistant from Google Deepmind pair programming with the developer.",
      },
      {
        name: "Claude Code",
        icon: "terminal",
        role: "Agentic CLI Coding Companion",
        category: "ai",
        url: "https://docs.anthropic.com/en/docs/agents-and-subagents",
        why: "Agentic developer CLI by Anthropic that runs locally for high-speed file editing and terminal command execution.",
      },
      {
        name: "GitNexus",
        icon: "git",
        role: "Code knowledge graph (MCP)",
        category: "ai",
        url: "https://gitnexus.dev",
        why: "Provides unified codebase context (548 symbols, 678 relationships) to all agents via MCP.",
      },
      {
        name: "9Router",
        icon: "route",
        role: "Centralized LLM API Gateway",
        category: "ai",
        url: "https://9router.phieucaphe.com",
        why: "All LLM calls routed here. No local LLMs on VPS. Dedicated gateway for managing AI requests securely.",
      },
      {
        name: "Superpowers Skills",
        icon: "zap",
        role: "AI workflow skills",
        category: "ai",
        url: "https://skills.sh",
        why: "brainstorming → writing-plans → tdd → diagnose → verify. Committed to .agents/skills/ for offline use.",
      },
      {
        name: "Playwright",
        icon: "playwright",
        role: "E2E + API testing",
        category: "ai",
        url: "https://playwright.dev",
        why: "TDD — no code ships without passing tests. Used by both human devs and Hermes Agent.",
      },
    ],
  ```

- [ ] **Step 3: Commit Constants & Stack Data changes**
      Run: `git commit -am "chore: add tech tools and ai agents to database constants"`

---

### Task 2: ProjectDialog Screenshot Rendering

**Files:**

- Modify: `components/portfolio/ProjectDialog.tsx`

- [ ] **Step 1: Update UI Layout to Render Image**
      Import any required attributes and insert the `image` container below the tags list (after line 102).

  ```tsx
  {
    /* Tags */
  }
  <div className="flex flex-wrap gap-2 mb-6">
    {project.tags.map((tag) => (
      <span
        key={tag}
        className="text-xs px-2.5 py-1 rounded-full"
        style={{
          background: "var(--accent-glow)",
          color: "var(--accent)",
        }}
      >
        {tag}
      </span>
    ))}
  </div>;

  {
    /* Project Screenshot (New!) */
  }
  {
    project.image && (
      <div
        className="mb-6 overflow-hidden rounded-xl border bg-muted/10 aspect-video relative flex items-center justify-center"
        style={{ borderColor: "var(--border)" }}
      >
        <img
          src={project.image}
          alt={`${project.title} screenshot`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit UI updates**
      Run: `git commit -am "feat: render optional project screenshot in details dialog"`

---

### Task 3: Build Verification & Playwright E2E Tests

**Files:**

- Run checks: terminal environment

- [ ] **Step 1: Check compilation and linting**
      Run: `npm run check` or `npm run build`
      Expected: Command completes without syntax/type errors.

- [ ] **Step 2: Run Playwright test suite**
      Run: `npx playwright test`
      Expected: All tests pass.

- [ ] **Step 3: Verify the UI locally**
      We will verify using the `verify` skill.
