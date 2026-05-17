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
      why: "SSG for Portfolio SEO, RSC for Dashboard performance. No pages/ dir — App Router only.",
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
      why: "End-to-end type safety across frontend + backend.",
    },
    {
      name: "Tailwind CSS v4",
      icon: "tailwindcss",
      role: "Utility-first styling",
      category: "frontend",
      url: "https://tailwindcss.com",
      version: "4",
      why: "Token-based design system via @theme. Rapid UI iteration.",
    },
    {
      name: "ShadcnUI",
      icon: "shadcnui",
      role: "Component library",
      category: "frontend",
      url: "https://ui.shadcn.com",
      why: "Accessible, unstyled components — full design control.",
    },
    {
      name: "Remotion",
      icon: "remotion",
      role: "Programmatic video creation",
      category: "frontend",
      url: "https://remotion.dev",
      version: "4",
      why: "React-based video compositions embedded via @remotion/player. No MP4 files needed.",
    },
  ],
  backend: [
    {
      name: "NestJS",
      icon: "nestjs",
      role: "API framework",
      category: "backend",
      url: "https://nestjs.com",
      why: "Modular, decorator-based. Guards for API key auth (Hermes endpoints).",
    },
    {
      name: "PostgreSQL 16",
      icon: "postgresql",
      role: "Primary database",
      category: "backend",
      url: "https://postgresql.org",
      version: "16",
      why: "Business data + runtime state. TypeORM auto-migrates schema on start.",
    },
    {
      name: "TypeORM",
      icon: "typeorm",
      role: "ORM + auto-migrations",
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
      why: "4 containers: postgres, api, hermes-gateway, cloudflared. 100% reproducible.",
    },
    {
      name: "DigitalOcean VPS",
      icon: "digitalocean",
      role: "Backend + AI hosting",
      category: "infrastructure",
      url: "https://digitalocean.com",
      why: "Self-hosted for direct Hermes access. No cold starts. Named volumes for persistent AI brains.",
    },
    {
      name: "Vercel",
      icon: "vercel",
      role: "Frontend hosting (edge)",
      category: "infrastructure",
      url: "https://vercel.com",
      why: "SSG/ISR, global CDN, zero-config Next.js deploy. Triggered via Vercel CLI from CI/CD.",
    },
    {
      name: "Cloudflare",
      icon: "cloudflare",
      role: "WAF + DNS + Tunnel",
      category: "infrastructure",
      url: "https://cloudflare.com",
      why: "DDoS protection, DNS proxy. Cloudflare Tunnel exposes VPS services without open ports.",
    },
    {
      name: "Docker Compose",
      icon: "docker",
      role: "Multi-container orchestration",
      category: "infrastructure",
      url: "https://docs.docker.com/compose",
      why: "Single command to spin up the full stack: `docker compose up -d`.",
    },
  ],
  ai: [
    {
      name: "Hermes Agent",
      icon: "robot",
      role: "Autonomous AI worker on VPS",
      category: "ai",
      url: "https://hermes.ai",
      why: "Runs cronjobs, writes code, fixes PRs. Cron-Polled Fix + SQLite dedup + git worktrees.",
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
  cicd: [
    {
      name: "GitHub Actions",
      icon: "githubactions",
      role: "CI/CD orchestration",
      category: "cicd",
      url: "https://github.com/features/actions",
      why: "Backend-first deploy: SSH → VPS → health check → Vercel CLI. Prevents race conditions.",
    },
    {
      name: "Husky",
      icon: "git",
      role: "Git hooks (pre-commit)",
      category: "cicd",
      url: "https://typicode.github.io/husky",
      why: "Enforces lint-staged + commitlint on every commit. Blocks bad commits before they hit CI.",
    },
    {
      name: "release-please",
      icon: "tag",
      role: "Automated semantic versioning",
      category: "cicd",
      url: "https://github.com/googleapis/release-please",
      why: "Auto-generates CHANGELOG + bumps package.json version from Conventional Commits on main.",
    },
    {
      name: "Conventional Commits",
      icon: "gitcommit",
      role: "Commit message standard",
      category: "cicd",
      url: "https://conventionalcommits.org",
      why: "Required by release-please to calculate correct semver (feat→minor, fix→patch).",
    },
  ],
  observability: [
    {
      name: "Sentry",
      icon: "sentry",
      role: "Error tracking + alerting",
      category: "observability",
      url: "https://sentry.io",
      why: "Captures unhandled errors → webhook → auto-creates GitHub Issues → Hermes fixes autonomously.",
    },
    {
      name: "GitHub Issues",
      icon: "github",
      role: "Task orchestrator",
      category: "observability",
      url: "https://github.com",
      why: "Single source of truth for all tasks. Hermes reads + updates issues. Sentry errors become issues.",
    },
    {
      name: "GitHub Projects",
      icon: "github",
      role: "Kanban board",
      category: "observability",
      url: "https://github.com",
      why: "Visual task management: To-do / In Progress / Done. Hermes syncs task state here.",
    },
  ],
};

export const categoryMeta: Record<
  string,
  { label: string; description: string; color: string; videoIndex: number }
> = {
  frontend: {
    label: "Frontend",
    description: "UI, rendering & browser-side logic",
    color: "#60A5FA",
    videoIndex: 0,
  },
  backend: {
    label: "Backend",
    description: "API, database & server-side processing",
    color: "#34D399",
    videoIndex: 0,
  },
  infrastructure: {
    label: "Infrastructure",
    description: "Hosting, networking & containerization",
    color: "#F59E0B",
    videoIndex: 0,
  },
  ai: {
    label: "AI & Automation",
    description: "Autonomous agents, LLMs & intelligent workflows",
    color: "#A78BFA",
    videoIndex: 1,
  },
  cicd: {
    label: "CI/CD",
    description: "Automated testing, releases & deployments",
    color: "#F472B6",
    videoIndex: 2,
  },
  observability: {
    label: "Observability",
    description: "Error tracking, task management & monitoring",
    color: "#FB923C",
    videoIndex: 4,
  },
};
