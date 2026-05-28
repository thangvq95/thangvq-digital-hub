# Design Spec: PR Title Checker Workflow & Tech Stack Tags Update

**Date:** 2026-05-20  
**Status:** Draft  
**Author:** Antigravity

---

## 1. Objectives & Goals

1. **Robust Release Pipeline (Hard Gate):**
   Prevent PRs with non-conventional titles (like `chore/update experience timeline`) from being merged into `main`. This ensures that `release-please` always parses commits correctly, automatically triggers version bumps, and kicks off deployment.
2. **Enhance Portfolio Project Stack:**
   Update the "ThangVQ Digital Hub" project card on the portfolio page with modern infrastructure tags (`VPS Digital Ocean`, `Cloudflare`, `Vercel`, `GitNexus`).
3. **Interactive Project Card Link:**
   Provide a "More →" button/badge on project cards with a valid `stackProject` that links directly to the corresponding "How This Was Built" `/stack` page. Clicking this badge must navigate to the stack page and _not_ open the project detail modal.

---

## 2. Proposed Changes

### A. CI/CD: Pull Request Title Checker

We will add a new GitHub Actions workflow at `.github/workflows/pr-title-checker.yml` using `amannn/action-semantic-pull-request@v5`.

- **Triggers:** `pull_request` on `opened`, `edited`, `synchronize`.
- **Validation Rules:** The PR title must match Conventional Commits format (`feat: ...`, `fix: ...`, `chore: ...`, etc.).
- **Benefits:** Prevents automated or manual merging of PRs with incorrect titles, ensuring version bumps and deployments run automatically.

### B. Constants Update: `lib/constants.ts`

We will update the tags of the "ThangVQ Digital Hub" project:

```diff
   {
     title: "ThangVQ Digital Hub",
     description:
       "Developer intelligence platform with AI-powered trending repo analysis and release monitoring.",
-    tags: ["Next.js", "Tailwind", "Hermes", "Playwright"],
+    tags: [
+      "Next.js",
+      "Tailwind",
+      "Hermes",
+      "Playwright",
+      "VPS Digital Ocean",
+      "Cloudflare",
+      "Vercel",
+      "GitNexus"
+    ],
     url: "https://thangvq95.page",
     stackProject: "",
   },
```

### C. UI Update: `components/portfolio/ProjectsSection.tsx`

Currently, each project card is rendered as a `<button>` that opens the details dialog on click. To support nested clickable elements (the "More" link) without invalid HTML nesting:

1. **Card Container:** Change the outer tag from `<button>` to `<div>` with `role="button"`, `tabIndex={0}`, and appropriate keyboard listeners (`Enter`, `Space`) for accessibility.
2. **"More →" Badge:**
   - Render a `"More →"` badge at the end of the tags list for any project that has a defined `stackProject` (i.e. `stackProject !== null` and `stackProject !== undefined`).
   - Use Next.js `<Link>` for fast client-side navigation.
   - Styling: Use `var(--accent)` (green) as the background with contrasting black text (`#000`) and a hover effect.
   - Event Handler: Call `e.stopPropagation()` on click to prevent triggering the card's click handler (which would open the modal dialog).

---

## 3. Detailed UI Design (ProjectsSection)

We will modify the JSX rendering inside `ProjectsSection.tsx`:

```tsx
// Calculate local stack URL
const stackUrl =
  project.stackProject !== null && project.stackProject !== undefined
    ? project.stackProject === ""
      ? "/stack"
      : `/stack?project=${project.stackProject}`
    : null;
```

And in the card render block:

```tsx
<div
  key={project.title}
  data-testid={`project-card-${i}`}
  onClick={() => setSelected(project)}
  className="p-6 rounded-2xl glass card-hover group text-left w-full cursor-pointer transition-all duration-200"
  style={{ border: "1px solid var(--border)" }}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelected(project);
    }
  }}
  aria-label={`View details for ${project.title}`}
>
  ...
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
      <Link
        href={stackUrl}
        onClick={(e) => {
          e.stopPropagation(); // Avoid opening the dialog
        }}
        className="text-xs px-2.5 py-1 rounded-full hover:brightness-110 active:scale-95 transition-all duration-150 font-semibold"
        style={{
          background: "var(--accent)",
          color: "#000",
        }}
      >
        More →
      </Link>
    )}
  </div>
</div>
```

---

## 4. Verification & Testing

- **Lint & Build:** Run `npm run lint` and `npm run build` to verify there are no compilation or TypeScript errors.
- **Visual & Navigation Check:** Click on the "More →" button to confirm it navigates to `/stack` (or the specific project sub-route) and does _not_ open the popup modal. Click anywhere else on the card to confirm the modal dialog still opens correctly.
- **Playwright Test:** Run Playwright E2E tests to verify no regressions in the portfolio interaction flow.
