// ─── Domain Classifications ──────────────────────────────────────────────────
export const DOMAINS = [
  "AI Agent",
  "AI/ML",
  "Frontend",
  "Backend",
  "Mobile",
  "DevOps",
  "Design",
  "Database",
  "Security",
  "Fintech",
  "Blockchain",
  "CLI Tool",
  "Game Dev",
  "Data Science",
  "Cloud Native",
  "IoT",
  "Education",
  "Productivity",
  "Media",
  "Testing",
  "Language/Runtime",
  "Framework",
] as const;

export type Domain = (typeof DOMAINS)[number];

// ─── Rank Period Labels ───────────────────────────────────────────────────────
export const RANK_PERIODS = {
  daily: "Daily Trending",
  weekly: "Weekly Trending",
  monthly: "Monthly Trending",
} as const;

export type RankPeriod = keyof typeof RANK_PERIODS;

// ─── Portfolio: Tech Stack ────────────────────────────────────────────────────
export const TECH_STACK: { name: string; items: string[] }[] = [
  {
    name: "Mobile (Primary)",
    items: ["Flutter", "Dart", "Riverpod", "Bloc", "Clean Architecture"],
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
    items: ["Android Studio", "Figma", "Google Maps API", "Google Analytics"],
  },
  {
    name: "Workflow",
    items: ["Git", "Design Patterns", "Claude", "Gemini"],
  },
];

// ─── Portfolio: Experience ────────────────────────────────────────────────────
export const EXPERIENCE: {
  period: string;
  company: string;
  role: string;
  duration: string;
  highlights: string;
}[] = [
  {
    period: "Dec 2020 — Present",
    company: "Care",
    role: "Flutter Engineer",
    duration: "~5.5 years",
    highlights: "Primary mobile engineer. Built CI/CD, implemented design patterns and clean architecture across multiple production releases.",
  },
  {
    period: "Jul 2019 — Nov 2020",
    company: "Rovo",
    role: "Flutter Engineer",
    duration: "1y 5m",
    highlights: "Sports activity booking app. Full CI/CD pipeline, design patterns, cross-platform delivery.",
  },
  {
    period: "Feb 2018 — Jun 2019",
    company: "UpUp App",
    role: "Flutter Engineer",
    duration: "1y 5m",
    highlights: "Early Flutter adopter. Built from ground up during Flutter beta era.",
  },
  {
    period: "Oct 2016 — Jan 2018",
    company: "TMA Solutions",
    role: "Android Engineer",
    duration: "1y 4m",
    highlights: "Android native development with Java. Enterprise project delivery.",
  },
];

// ─── Portfolio: Featured Projects ─────────────────────────────────────────────
export const PROJECTS: {
  title: string;
  description: string;
  tags: string[];
  url?: string;
}[] = [
  {
    title: "Sổ Giáo Dân",
    description:
      "Full-stack parish management platform with NestJS API, PostgreSQL, and Next.js dashboard.",
    tags: ["NestJS", "Next.js", "PostgreSQL", "Docker"],
    url: "https://sogioadan.com",
  },
  {
    title: "ThangVQ Digital Hub",
    description:
      "Developer intelligence platform with AI-powered trending repo analysis and release monitoring.",
    tags: ["Next.js", "Tailwind", "Hermes", "Playwright"],
    url: "https://thangvq95.page",
  },
  {
    title: "Care Mobile App",
    description:
      "Production Flutter app serving thousands of users. Built CI/CD pipelines and clean architecture.",
    tags: ["Flutter", "Dart", "Riverpod", "CI/CD"],
  },
  {
    title: "Self-Hosted Infrastructure",
    description:
      "Mac Mini M4 Pro production server running Docker, Cloudflare Tunnels, and autonomous AI agents.",
    tags: ["Docker", "Cloudflare", "GitHub Actions", "Mac Mini"],
  },
];

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const SITE_URL = "https://thangvq95.page";
export const GITHUB_URL = "https://github.com/thangvq95";
export const LINKEDIN_URL = "https://linkedin.com/in/thangvq95";
