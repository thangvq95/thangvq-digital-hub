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
  projectTitle?: string;
  tags?: string[];
  contributions: string[];
}[] = [
  {
    period: "Dec 2021 — Present",
    company: "Care",
    role: "Flutter Engineer",
    duration: "~4.5 years",
    highlights:
      "Primary mobile engineer. Built CI/CD, implemented design patterns and clean architecture across multiple production releases.",
    projectTitle: "Care Mobile App",
    contributions: [
      "Spearheaded mobile development of GP Teleconsultation and eQueue management modules using Flutter.",
      "Implemented reactive state management using Riverpod to handle real-time doctor queue updates.",
      "Integrated Health SDK (iOS HealthKit / Android Google Fit) for patient vitals tracking.",
      "Set up automated CI/CD pipelines via Codemagic and Fastlane for rapid App Store/Play Store deployments.",
      "Engineered secure end-to-end video consultation features powered by Twilio Video SDK.",
    ],
  },
  {
    period: "Jul 2019 — Dec 2021",
    company: "Rovo",
    role: "Flutter Engineer",
    duration: "2y 5m",
    highlights:
      "Sports activity booking app. Full CI/CD pipeline, design patterns, cross-platform delivery.",
    projectTitle: "Rovo Mobile App",
    contributions: [
      "Architected the venue booking flow and sport partner matching features using Google Maps integration.",
      "Developed customized in-app video chat capabilities leveraging Agora Video SDK.",
      "Designed and optimized the real-time active leaderboards and group activity feeds.",
      "Configured Firebase Analytics, Dynamic Links, and push notification triggers for user engagement.",
      "Maintained a single codebase for Android and iOS using Flutter, resulting in 40%+ faster feature rollout.",
    ],
  },
  {
    period: "Feb 2018 — Jun 2019",
    company: "UpUp App",
    role: "Flutter Engineer",
    duration: "1y 4m",
    highlights:
      "Early Flutter adopter. Started with Flutter beta and delivered production builds inline with the 1.0.0 stable release in Dec 2018.",
    tags: ["Flutter", "Dart", "Beta Adopter", "Animation", "Git"],
    contributions: [
      "Adopted Flutter in its early beta stage (mid-2018), transitioning the product to Flutter 1.0 stable.",
      "Built smooth UI animations, custom charts, and progress tracking visualizations.",
      "Integrated Local Auth (Biometrics) and secure storage for user authentication.",
      "Wrote clean, modular UI components ensuring high test coverage across different device sizes.",
    ],
  },
  {
    period: "Jan 2017 — Jan 2018",
    company: "TMA Solutions",
    role: "Android Engineer",
    duration: "1 year",
    highlights:
      "Android native development with Java. Enterprise project delivery.",
    tags: ["Android", "Java", "RxJava", "SQLite", "Agile"],
    contributions: [
      "Developed native Android applications using Java, RxJava, and Android SDK.",
      "Implemented offline-first synchronization using SQLite database and local caching.",
      "Refactored legacy codebase to follow MVP (Model-View-Presenter) pattern, reducing crash rates.",
      "Worked in an Agile Scrum environment communicating directly with overseas clients.",
    ],
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
  contributions?: string[];
  type?: "personal" | "company";
}[] = [
  {
    title: "Sổ Giáo Dân",
    description:
      "Full-stack parish management platform with NestJS API, PostgreSQL, and Next.js dashboard.",
    tags: [
      "NestJS",
      "Next.js",
      "PostgreSQL",
      "Docker",
      "Github Action",
      "Self-Host",
      "Cloudflare",
    ],
    url: "https://sogioadan.com",
    stackProject: "sogiaodan",
    contributions: [
      "Architected the full-stack database schema using NestJS and PostgreSQL.",
      "Implemented secure authentication and role-based access control (RBAC).",
      "Developed a highly responsive parish dashboard in Next.js.",
      "Configured Dockerized deployment pipeline for reproducible server environments.",
    ],
    type: "personal",
  },
  {
    title: "ThangVQ Digital Hub",
    description:
      "Developer intelligence platform with AI-powered trending repo analysis and release monitoring.",
    tags: [
      "Next.js",
      "Nest.js",
      "PostgreSQL",
      "Playwright",
      "Cloudflare",
      "Vercel",
      "VPS Digital Ocean",
      "Github Action",
      "Hermes",
    ],
    url: "https://thangvq95.page/tech",
    stackProject: "",
    images: ["/screenshots/techtrend.png"],
    contributions: [
      "Created programmatic video generator using Remotion to visualize architectural flow.",
      "Configured continuous integration with Playwright tests for robust verification.",
      "Integrated Sentry observability to capture server issues with automatic webhook triggers.",
      "Set up zero-downtime VPS deployment with Cloudflare Tunnels and reverse proxy.",
    ],
    type: "personal",
  },
  {
    title: "Care Mobile App",
    description:
      "Healthcare app (Raffles Connect) serving thousands of patients in Singapore. Features GP teleconsult, eQueue management, and health screening packages. Built with Flutter, clean architecture, and full CI/CD pipeline.",
    tags: [
      "Flutter",
      "Dart",
      "Riverpod",
      "GetX",
      "OneSignal",
      "Health SDK",
      "CI/CD",
      "Twilio SDK",
    ],
    url: "https://apps.apple.com/vn/app/raffles-connect/id1444394990",
    stackProject: "care-health",
    images: [
      "/screenshots/care-health/01.png",
      "/screenshots/care-health/02.png",
      "/screenshots/care-health/03.png",
      "/screenshots/care-health/04.png",
      "/screenshots/care-health/05.png",
    ],
    contributions: [
      "Spearheaded mobile development of GP Teleconsultation and eQueue management modules using Flutter.",
      "Implemented reactive state management using Riverpod to handle real-time doctor queue updates.",
      "Integrated Health SDK (iOS HealthKit / Android Google Fit) for patient vitals tracking.",
      "Set up automated CI/CD pipelines via Codemagic and Fastlane for rapid App Store/Play Store deployments.",
      "Engineered secure end-to-end video consultation features powered by Twilio Video SDK.",
    ],
    type: "company",
  },
  {
    title: "Rovo Mobile App",
    description:
      "Sports & fitness social platform allowing users to find sports partners, book venues, and track activities. Features custom workout routines, active leaderboards, and map-based activity discovery. Built with Flutter, Dart, and Google Maps API.",
    tags: [
      "Flutter",
      "Dart",
      "Firebase",
      "Google Maps",
      "Agora Video",
      "Codemagic CICD",
    ],
    url: "https://apps.apple.com/sg/app/rovo-sports-fitness-app/id1044009295",
    stackProject: "rovo-sports",
    images: [
      "/screenshots/rovo-sports/1.png",
      "/screenshots/rovo-sports/2.png",
      "/screenshots/rovo-sports/3.png",
      "/screenshots/rovo-sports/4.png",
      "/screenshots/rovo-sports/5.png",
      "/screenshots/rovo-sports/6.png",
      "/screenshots/rovo-sports/7.png",
    ],
    contributions: [
      "Architected the venue booking flow and sport partner matching features using Google Maps integration.",
      "Developed customized in-app video chat capabilities leveraging Agora Video SDK.",
      "Designed and optimized the real-time active leaderboards and group activity feeds.",
      "Configured Firebase Analytics, Dynamic Links, and push notification triggers for user engagement.",
      "Maintained a single codebase for Android and iOS using Flutter, resulting in 40%+ faster feature rollout.",
    ],
    type: "company",
  },
];

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const SITE_URL = "https://thangvq95.page";
export const GITHUB_URL = "https://github.com/thangvq95";
export const LINKEDIN_URL = "https://linkedin.com/in/thangvq95";
