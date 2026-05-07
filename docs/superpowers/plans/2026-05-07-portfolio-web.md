# Portfolio Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, Liquid Glass–styled portfolio page at `/` with all 6 sections defined in `docs/portfolio-content.md`.

**Architecture:** Static (SSG) Next.js 16 page. All components are Server Components (no `"use client"`). Design tokens and animations already exist in `app/globals.css`. Data lives in `lib/constants.ts`. Playwright E2E tests validate each section.

**Tech Stack:** Next.js 16, Tailwind CSS v4, Lucide React icons, Playwright

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Keep | `app/page.tsx` | Page composition (already wired) |
| Keep | `app/globals.css` | Design tokens + animations (already done) |
| Keep | `lib/constants.ts` | Portfolio data (TECH_STACK, EXPERIENCE) |
| Modify | `components/portfolio/HeroSection.tsx` | Hero with particle grid + gradient text |
| Modify | `components/portfolio/AboutSection.tsx` | About me glass cards |
| Modify | `components/portfolio/TechStackSection.tsx` | Interactive tech grid |
| Modify | `components/portfolio/ExperienceSection.tsx` | Timeline with glass cards |
| Modify | `components/portfolio/ProjectsSection.tsx` | Featured project cards |
| Modify | `components/portfolio/ContactFooter.tsx` | Contact links + footer |
| Create | `tests/portfolio.spec.ts` | E2E tests for all sections |
| Modify | `playwright.config.ts` | Enable webServer + baseURL |

---

### Task 1: Playwright Test Infrastructure

**Files:**
- Modify: `playwright.config.ts`
- Create: `tests/portfolio.spec.ts`
- Remove: `tests/example.spec.ts`

- [ ] **Step 1: Configure Playwright with dev server**

```ts
// playwright.config.ts — replace the full file
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 2: Write skeleton E2E test for portfolio sections**

```ts
// tests/portfolio.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Portfolio Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with name and CTA buttons', async ({ page }) => {
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
    await expect(hero.getByText('Thang VQ')).toBeVisible();
    await expect(page.locator('#hero-view-projects')).toBeVisible();
    await expect(page.locator('#hero-download-cv')).toBeVisible();
  });

  test('renders about section', async ({ page }) => {
    const about = page.locator('#about');
    await expect(about).toBeVisible();
    await expect(about.getByRole('heading', { name: /about/i })).toBeVisible();
  });

  test('renders tech stack section with category cards', async ({ page }) => {
    const techStack = page.locator('#tech-stack');
    await expect(techStack).toBeVisible();
    const cards = techStack.locator('[data-testid^="tech-category-"]');
    await expect(cards).toHaveCount(5);
  });

  test('renders experience timeline with 4 entries', async ({ page }) => {
    const experience = page.locator('#experience');
    await expect(experience).toBeVisible();
    const entries = experience.locator('[data-testid^="exp-entry-"]');
    await expect(entries).toHaveCount(4);
  });

  test('renders projects section', async ({ page }) => {
    const projects = page.locator('#projects');
    await expect(projects).toBeVisible();
    await expect(projects.getByRole('heading', { name: /projects/i })).toBeVisible();
  });

  test('renders contact footer with social links', async ({ page }) => {
    const footer = page.locator('#contact-footer');
    await expect(footer).toBeVisible();
    await expect(page.locator('#footer-github-link')).toBeVisible();
    await expect(page.locator('#footer-linkedin-link')).toBeVisible();
  });
});
```

- [ ] **Step 3: Delete example test**

```bash
rm tests/example.spec.ts
```

- [ ] **Step 4: Run tests to verify they fail (red)**

Run: `npx playwright test tests/portfolio.spec.ts --project=chromium`
Expected: FAIL — sections exist as skeleton but missing required IDs/content.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/
git commit -m "test: add portfolio E2E tests + configure Playwright dev server"
```

---

### Task 2: HeroSection with Animations

**Files:**
- Modify: `components/portfolio/HeroSection.tsx`

- [ ] **Step 1: Implement HeroSection with particle grid and gradient text**

```tsx
// components/portfolio/HeroSection.tsx
const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Dot grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Accent glow orb */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
        style={{ background: "var(--accent)" }}
      />
      {/* Secondary glow orb */}
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[100px] opacity-10"
        style={{ background: "hsl(280, 100%, 70%)" }}
      />

      <div className="relative z-10 text-center px-4 animate-fade-in-up">
        <p
          className="text-sm font-medium tracking-widest uppercase mb-4"
          style={{ color: "var(--accent)" }}
        >
          Software Engineer &middot; 10+ Years in Production
        </p>
        <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tight mb-6">
          <span className="gradient-text">Thang VQ</span>
        </h1>
        <p
          className="text-lg sm:text-xl font-light mb-4 max-w-2xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Building high-performance applications with modern web &amp; mobile stacks
        </p>
        <p
          className="max-w-xl mx-auto text-sm mb-10"
          style={{ color: "var(--text-muted)" }}
        >
          Flutter &amp; mobile as primary career background, now expanding into full-stack web &amp; autonomous software engineering
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#projects"
            id="hero-view-projects"
            className="px-8 py-3 rounded-full font-medium transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 cursor-pointer"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            View Projects
          </a>
          <a
            href="/resume.pdf"
            id="hero-download-cv"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full font-medium glass transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            style={{ color: "var(--text-primary)", border: "1px solid var(--border)" }}
          >
            Download CV
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
```

- [ ] **Step 2: Run hero test**

Run: `npx playwright test tests/portfolio.spec.ts -g "renders hero section" --project=chromium`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/HeroSection.tsx
git commit -m "feat(portfolio): implement HeroSection with liquid glass effects"
```

---

### Task 3: AboutSection with Glass Cards

**Files:**
- Modify: `components/portfolio/AboutSection.tsx`

- [ ] **Step 1: Implement AboutSection**

```tsx
// components/portfolio/AboutSection.tsx
import { Code2, Cpu, Rocket, Server } from "lucide-react";

const highlights = [
  {
    icon: Code2,
    title: "10+ Years Experience",
    description: "Building production applications across multiple startups and enterprise environments.",
  },
  {
    icon: Cpu,
    title: "Mobile-First Expert",
    description: "Flutter & Android as primary career background with deep CI/CD and architecture expertise.",
  },
  {
    icon: Server,
    title: "Infrastructure Enthusiast",
    description: "Self-hosted Mac Mini M4 Pro production server. Docker, Cloudflare, automated deployments.",
  },
  {
    icon: Rocket,
    title: "AI-Assisted Development",
    description: "Exploring Autonomous Software Engineering (ASE) with Hermes Agent and AI-powered workflows.",
  },
];

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: "var(--text-primary)" }}>
          About Me
        </h2>
        <p className="text-center max-w-2xl mx-auto mb-16 text-base" style={{ color: "var(--text-secondary)" }}>
          Experienced software engineer with a passion for crafting high-quality mobile and web experiences. Hard-working, quick-learning, and always seeking challenging environments.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {highlights.map((item, i) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl glass card-hover"
              style={{ border: "1px solid var(--border)", animationDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--accent-glow)" }}>
                <item.icon size={20} style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
```

- [ ] **Step 2: Run about test**

Run: `npx playwright test tests/portfolio.spec.ts -g "renders about section" --project=chromium`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/AboutSection.tsx
git commit -m "feat(portfolio): implement AboutSection with glass highlight cards"
```

---

### Task 4: TechStackSection Interactive Grid

**Files:**
- Modify: `components/portfolio/TechStackSection.tsx`

- [ ] **Step 1: Implement TechStackSection**

```tsx
// components/portfolio/TechStackSection.tsx
import { TECH_STACK } from "@/lib/constants";

const TechStackSection: React.FC = () => {
  return (
    <section id="tech-stack" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: "var(--text-primary)" }}>
          Tech Stack
        </h2>
        <p className="text-center max-w-2xl mx-auto mb-16 text-base" style={{ color: "var(--text-secondary)" }}>
          Technologies and tools I use daily to build production applications.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TECH_STACK.map((category, i) => (
            <div
              key={category.name}
              data-testid={`tech-category-${i}`}
              className="p-6 rounded-2xl glass card-hover"
              style={{ border: "1px solid var(--border)", animationDelay: `${i * 80}ms` }}
            >
              <h3 className="text-base font-semibold mb-4" style={{ color: "var(--accent)" }}>{category.name}</h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors duration-200"
                    style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
```

- [ ] **Step 2: Run tech stack test**

Run: `npx playwright test tests/portfolio.spec.ts -g "renders tech stack" --project=chromium`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/TechStackSection.tsx
git commit -m "feat(portfolio): implement TechStackSection with category grid"
```

---

### Task 5: ExperienceSection Timeline

**Files:**
- Modify: `components/portfolio/ExperienceSection.tsx`

- [ ] **Step 1: Implement ExperienceSection**

```tsx
// components/portfolio/ExperienceSection.tsx
import { EXPERIENCE } from "@/lib/constants";

const ExperienceSection: React.FC = () => {
  return (
    <section id="experience" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: "var(--text-primary)" }}>
          Experience
        </h2>
        <p className="text-center max-w-2xl mx-auto mb-16 text-base" style={{ color: "var(--text-secondary)" }}>
          A decade of building mobile and web applications across startups and enterprise.
        </p>
        <div className="relative">
          {/* Vertical line */}
          <div aria-hidden="true" className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px" style={{ background: "var(--border)" }} />
          <div className="space-y-12">
            {EXPERIENCE.map((exp, i) => (
              <div key={exp.company} data-testid={`exp-entry-${i}`} className={`relative flex flex-col sm:flex-row gap-4 ${i % 2 === 0 ? "sm:flex-row-reverse" : ""}`}>
                {/* Timeline dot */}
                <div
                  aria-hidden="true"
                  className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full -translate-x-1/2 mt-6 z-10"
                  style={{ background: i === 0 ? "var(--accent)" : "var(--border)", boxShadow: i === 0 ? "0 0 12px var(--accent-glow-strong)" : "none" }}
                />
                <div className="w-full sm:w-[calc(50%-2rem)] ml-10 sm:ml-0">
                  <div className="p-5 rounded-2xl glass card-hover" style={{ border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>{exp.duration}</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{exp.period}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{exp.company}</h3>
                    <p className="text-sm font-medium mb-2" style={{ color: "var(--accent)" }}>{exp.role}</p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{exp.highlights}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 text-center">
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>Education</p>
          <p style={{ color: "var(--text-primary)" }}>Ton Duc Thang University — B.S. Computer Science (2013–2017)</p>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
```

- [ ] **Step 2: Run experience test**

Run: `npx playwright test tests/portfolio.spec.ts -g "renders experience" --project=chromium`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/ExperienceSection.tsx
git commit -m "feat(portfolio): implement ExperienceSection with alternating timeline"
```

---

### Task 6: ProjectsSection Cards

**Files:**
- Modify: `lib/constants.ts` (add PROJECTS data)
- Modify: `components/portfolio/ProjectsSection.tsx`

- [ ] **Step 1: Add PROJECTS constant**

Append to end of `lib/constants.ts`:

```ts
// ─── Portfolio: Featured Projects ─────────────────────────────────────────────
export const PROJECTS: {
  title: string;
  description: string;
  tags: string[];
  url?: string;
}[] = [
  {
    title: "Sổ Giáo Dân",
    description: "Full-stack parish management platform with NestJS API, PostgreSQL, and Next.js dashboard.",
    tags: ["NestJS", "Next.js", "PostgreSQL", "Docker"],
    url: "https://sogioadan.com",
  },
  {
    title: "ThangVQ Digital Hub",
    description: "Developer intelligence platform with AI-powered trending repo analysis and release monitoring.",
    tags: ["Next.js", "Tailwind", "Hermes", "Playwright"],
    url: "https://thangvq95.page",
  },
  {
    title: "Care Mobile App",
    description: "Production Flutter app serving thousands of users. Built CI/CD pipelines and clean architecture.",
    tags: ["Flutter", "Dart", "Riverpod", "CI/CD"],
  },
  {
    title: "Self-Hosted Infrastructure",
    description: "Mac Mini M4 Pro production server running Docker, Cloudflare Tunnels, and autonomous AI agents.",
    tags: ["Docker", "Cloudflare", "GitHub Actions", "Mac Mini"],
  },
];
```

- [ ] **Step 2: Implement ProjectsSection**

```tsx
// components/portfolio/ProjectsSection.tsx
import { PROJECTS } from "@/lib/constants";
import { ExternalLink } from "lucide-react";

const ProjectsSection: React.FC = () => {
  return (
    <section id="projects" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: "var(--text-primary)" }}>
          Featured Projects
        </h2>
        <p className="text-center max-w-2xl mx-auto mb-16 text-base" style={{ color: "var(--text-secondary)" }}>
          A selection of projects that showcase my engineering approach.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PROJECTS.map((project, i) => (
            <div key={project.title} data-testid={`project-card-${i}`} className="p-6 rounded-2xl glass card-hover group" style={{ border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{project.title}</h3>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer" style={{ color: "var(--text-secondary)" }} aria-label={`Visit ${project.title}`}>
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
```

- [ ] **Step 3: Run projects test**

Run: `npx playwright test tests/portfolio.spec.ts -g "renders projects" --project=chromium`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add lib/constants.ts components/portfolio/ProjectsSection.tsx
git commit -m "feat(portfolio): implement ProjectsSection with project cards"
```

---

### Task 7: ContactFooter

**Files:**
- Modify: `components/portfolio/ContactFooter.tsx`

- [ ] **Step 1: Implement ContactFooter**

```tsx
// components/portfolio/ContactFooter.tsx
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/constants";
import { Github, Linkedin, Mail } from "lucide-react";

const socialLinks = [
  { id: "footer-github-link", href: GITHUB_URL, label: "GitHub", icon: Github },
  { id: "footer-linkedin-link", href: LINKEDIN_URL, label: "LinkedIn", icon: Linkedin },
  { id: "footer-email-link", href: "mailto:thangvq95@gmail.com", label: "Email", icon: Mail },
];

const ContactFooter: React.FC = () => {
  return (
    <footer id="contact-footer" className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Get In Touch</h2>
        <p className="max-w-lg mx-auto mb-10 text-base" style={{ color: "var(--text-secondary)" }}>
          Open to interesting opportunities and collaborations. Let&apos;s connect.
        </p>
        <div className="flex justify-center gap-6 mb-12">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              id={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full glass flex items-center justify-center transition-all duration-200 hover:-translate-y-1 cursor-pointer"
              style={{ border: "1px solid var(--border)" }}
              aria-label={link.label}
            >
              <link.icon size={20} style={{ color: "var(--text-secondary)" }} />
            </a>
          ))}
        </div>
        <div className="pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Built with Next.js &middot; Hosted on Vercel &middot; &copy; {new Date().getFullYear()} Thang VQ
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ContactFooter;
```

- [ ] **Step 2: Run full portfolio test suite**

Run: `npx playwright test tests/portfolio.spec.ts --project=chromium`
Expected: ALL PASS (6 tests)

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/ContactFooter.tsx
git commit -m "feat(portfolio): implement ContactFooter with social links"
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(portfolio): complete Phase 1 portfolio page — all sections with E2E tests"
```
