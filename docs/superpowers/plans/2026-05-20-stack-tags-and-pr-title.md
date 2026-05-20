# PR Title Checker & Tech Stack Tags Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a PR title validation CI workflow and update the portfolio tags/links for the tech stack page.

**Architecture:** Use `amannn/action-semantic-pull-request` on GitHub Actions to check PR titles. Update card container in `ProjectsSection.tsx` from `<button>` to `<div>` to allow inner Next.js `<Link>` for direct routing to `/stack` while preventing propagation. Add additional infrastructure tags in `lib/constants.ts`.

**Tech Stack:** GitHub Actions, Next.js, React, Tailwind CSS

---

### Task 1: PR Title Checker GitHub Workflow

**Files:**

- Create: `.github/workflows/pr-title-checker.yml`

- [ ] **Step 1: Create the workflow file**
      Create `.github/workflows/pr-title-checker.yml` with the following content:

  ```yaml
  name: "PR Title Checker"

  on:
    pull_request:
      types:
        - opened
        - edited
        - synchronize

  permissions:
    pull-requests: read

  jobs:
    main:
      name: Validate PR Title
      runs-on: ubuntu-latest
      steps:
        - uses: amannn/action-semantic-pull-request@v5
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          with:
            types: |
              feat
              fix
              chore
              docs
              style
              refactor
              perf
              test
              ci
              build
            requireScope: false
  ```

- [ ] **Step 2: Commit Task 1**
  ```bash
  git add .github/workflows/pr-title-checker.yml
  git commit -m "ci: add PR title conventional commit validator workflow"
  ```

---

### Task 2: Update Tech Stack Constants

**Files:**

- Modify: `lib/constants.ts:121-128`

- [ ] **Step 1: Modify `PROJECTS` tags in `lib/constants.ts`**
      Find the entry for `ThangVQ Digital Hub` and update the tags list to include `"VPS Digital Ocean"`, `"Cloudflare"`, `"Vercel"`, and `"GitNexus"`.

  Target range `lib/constants.ts` around line 121:

  ```typescript
    {
      title: "ThangVQ Digital Hub",
      description:
        "Developer intelligence platform with AI-powered trending repo analysis and release monitoring.",
      tags: ["Next.js", "Tailwind", "Hermes", "Playwright"],
      url: "https://thangvq95.page",
      stackProject: "",
    },
  ```

  Replacement:

  ```typescript
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
        "GitNexus"
      ],
      url: "https://thangvq95.page",
      stackProject: "",
    },
  ```

- [ ] **Step 2: Run build to verify types**
      Run: `npm run build`
      Expected: Success without errors.

- [ ] **Step 3: Commit Task 2**
  ```bash
  git add lib/constants.ts
  git commit -m "chore: add DO VPS, Cloudflare, Vercel, and GitNexus tags to digital hub project"
  ```

---

### Task 3: Implement "More →" button in Project Card

**Files:**

- Modify: `components/portfolio/ProjectsSection.tsx:28-74`
- Modify: `tests/portfolio.spec.ts:35-41`

- [ ] **Step 1: Update card rendering in `ProjectsSection.tsx`**
      Modify `/Users/thang/Documents/thangvq-digital-hub/components/portfolio/ProjectsSection.tsx` to:
  1. Change the `<button>` card wrapper to a `<div>` with `role="button"` and keyboard listener to avoid nesting `<Link>` inside `<button>` (which is invalid HTML).
  2. Compute `stackUrl` using `stackProject`.
  3. Render the "More →" badge if `stackUrl` is defined, with click event propagation stopped.

  Target range `components/portfolio/ProjectsSection.tsx` lines 28 to 74:

  ```tsx
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {PROJECTS.map((project, i) => (
      <button
        key={project.title}
        data-testid={`project-card-${i}`}
        onClick={() => setSelected(project)}
        className="p-6 rounded-2xl glass card-hover group text-left w-full cursor-pointer transition-all duration-200"
        style={{ border: "1px solid var(--border)" }}
        aria-label={`View details for ${project.title}`}
      >
        <div className="flex items-start justify-between mb-3">
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {project.title}
          </h3>
          {/* Visual hint that card is clickable */}
          <span
            className="opacity-40 group-hover:opacity-80 transition-opacity text-xs mt-1"
            style={{ color: "var(--accent)" }}
          >
            ↗
          </span>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
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
        </div>
      </button>
    ))}
  </div>
  ```

  Replacement:

  ```tsx
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {PROJECTS.map((project, i) => {
      const stackUrl =
        project.stackProject !== null && project.stackProject !== undefined
          ? project.stackProject === ""
            ? "/stack"
            : `/stack?project=${project.stackProject}`
          : null;

      return (
        <div
          key={project.title}
          data-testid={`project-card-${i}`}
          onClick={() => setSelected(project)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelected(project);
            }
          }}
          role="button"
          tabIndex={0}
          className="p-6 rounded-2xl glass card-hover group text-left w-full cursor-pointer transition-all duration-200"
          style={{ border: "1px solid var(--border)" }}
          aria-label={`View details for ${project.title}`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {project.title}
            </h3>
            {/* Visual hint that card is clickable */}
            <span
              className="opacity-40 group-hover:opacity-80 transition-opacity text-xs mt-1"
              style={{ color: "var(--accent)" }}
            >
              ↗
            </span>
          </div>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
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
            {stackUrl && (
              <a
                href={stackUrl}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-xs px-2.5 py-1 rounded-full hover:brightness-110 active:scale-95 transition-all duration-150 font-semibold"
                style={{
                  background: "var(--accent)",
                  color: "#000",
                }}
              >
                More →
              </a>
            )}
          </div>
        </div>
      );
    })}
  </div>
  ```

- [ ] **Step 2: Add test import and helper function in `ProjectsSection.tsx`**
      Make sure `Link` is imported from `next/link`. We should use next/link instead of `a` for client-side routing. Let's write the import change in `ProjectsSection.tsx`:

  Target range `components/portfolio/ProjectsSection.tsx:1-5`:

  ```tsx
  "use client";

  import { useState } from "react";
  import { PROJECTS } from "@/lib/constants";
  import ProjectDialog from "./ProjectDialog";
  ```

  Replacement:

  ```tsx
  "use client";

  import { useState } from "react";
  import Link from "next/link";
  import { PROJECTS } from "@/lib/constants";
  import ProjectDialog from "./ProjectDialog";
  ```

  _(Update the `a` tag in Step 1 to `<Link href={stackUrl}>` instead of `<a href={stackUrl}>`)_

- [ ] **Step 3: Update Playwright tests in `tests/portfolio.spec.ts`**
      Update the portfolio test suite to verify the "More →" link works and that the card still opens the details modal.

  Target range `tests/portfolio.spec.ts:36-41`:

  ```typescript
  test("renders projects section", async ({ page }) => {
    const projects = page.locator("#projects");
    await expect(projects).toBeVisible();
    await expect(
      projects.getByRole("heading", { name: /projects/i }),
    ).toBeVisible();
  });
  ```

  Replacement:

  ```typescript
  test("renders projects section and handles links", async ({ page }) => {
    const projects = page.locator("#projects");
    await expect(projects).toBeVisible();
    await expect(
      projects.getByRole("heading", { name: /projects/i }),
    ).toBeVisible();

    // Find the card for ThangVQ Digital Hub (index 1)
    const hubCard = page.locator('[data-testid="project-card-1"]');
    await expect(hubCard).toBeVisible();

    // Check if "More →" button exists
    const moreLink = hubCard.locator("a", { hasText: "More →" });
    await expect(moreLink).toBeVisible();

    // Click "More →" and check it redirects to /stack
    await moreLink.click();
    await expect(page).toHaveURL(/\/stack$/);

    // Navigate back and click the card itself to verify modal dialog opens
    await page.goto("/");
    await page.locator('[data-testid="project-card-1"]').click();
    const dialog = page.locator("dialog");
    await expect(dialog).toBeVisible();
  });
  ```

- [ ] **Step 4: Run build and lint tests**
      Run: `npm run lint` and `npm run build`
      Expected: Success without errors.

- [ ] **Step 5: Run Playwright tests**
      Run: `npx playwright test`
      Expected: Success without errors.

- [ ] **Step 6: Commit Task 3**
  ```bash
  git add components/portfolio/ProjectsSection.tsx tests/portfolio.spec.ts
  git commit -m "feat: add client-side More link on project cards routing to stack page"
  ```
