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
    items: ["Firebase", "SQL", "Self Host", "Docker", "Cloudflare Tunnels"],
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
    ],
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
    period: "Feb 2022 — Present",
    company: "Care",
    role: "Flutter Engineer",
    duration: "~4.3 years",
    highlights:
      "Primary mobile engineer. Built CI/CD, implemented design patterns and clean architecture across multiple production releases.",
  },
  {
    period: "Dec 2019 — Jan 2022",
    company: "Rovo",
    role: "Flutter Engineer",
    duration: "2y 2m",
    highlights:
      "Sports activity booking app. Full CI/CD pipeline, design patterns, cross-platform delivery.",
  },
  {
    period: "Dec 2018 — Nov 2019",
    company: "UpUp App",
    role: "Flutter Engineer",
    duration: "1y",
    highlights:
      "Early Flutter adopter. Built from ground up during Flutter release 1.0.0 stable.",
  },
  {
    period: "Jan 2017 — Nov 2018",
    company: "TMA Solutions",
    role: "Android Engineer",
    duration: "1y 11m",
    highlights:
      "Android native development with Java. Enterprise project delivery.",
  },
];

// ─── Portfolio: Featured Projects ─────────────────────────────────────────────
export const PROJECTS: {
  title: string;
  description: string;
  tags: string[];
  url?: string;
  /** undefined = no stack page; "" = default (digital hub); "slug" = ?project=slug */
  stackProject?: string | null;
  /** Single image (legacy) or multiple images for swipeable carousel */
  images?: string[];
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
    images: ["/screenshots/techtrend.png"],
  },
  {
    title: "Care Mobile App",
    description:
      "Healthcare app (Raffles Connect) serving thousands of patients in Singapore. Features GP teleconsult, eQueue management, and health screening packages. Built with Flutter, clean architecture, and full CI/CD pipeline.",
    tags: ["Flutter", "Dart", "Riverpod", "CI/CD"],
    url: "https://apps.apple.com/vn/app/raffles-connect/id1444394990",
    stackProject: "care-health",
    images: [
      "/screenshots/care-health/01.png",
      "/screenshots/care-health/02.png",
      "/screenshots/care-health/03.png",
      "/screenshots/care-health/04.png",
      "/screenshots/care-health/05.png",
    ],
  },
  {
    title: "Rovo Mobile App",
    description:
      "Sports & fitness social platform allowing users to find sports partners, book venues, and track activities. Features custom workout routines, active leaderboards, and map-based activity discovery. Built with Flutter, Dart, and Google Maps API.",
    tags: ["Flutter", "Dart", "Firebase", "Google Maps"],
    url: "https://apps.apple.com/sg/app/rovo-sports-fitness-app/id1044009295",
    stackProject: null,
    images: [
      "/screenshots/rovo-sports/1.png",
      "/screenshots/rovo-sports/2.png",
      "/screenshots/rovo-sports/3.png",
      "/screenshots/rovo-sports/4.png",
    ],
  },
  {
    title: "Self-Hosted Infrastructure",
    description:
      "Mac Mini M4 Pro production server running Docker, Cloudflare Tunnels, and autonomous AI agents.",
    tags: ["Docker", "Cloudflare", "GitHub Actions", "Mac Mini"],
    stackProject: null,
  },
];

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const SITE_URL = "https://thangvq95.page";
export const GITHUB_URL = "https://github.com/thangvq95";
export const LINKEDIN_URL = "https://linkedin.com/in/thangvq95";
