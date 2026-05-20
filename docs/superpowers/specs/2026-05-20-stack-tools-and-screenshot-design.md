# Design Spec: Portfolio Tech Stack Tools Update & Project Screenshot Modal

**Date:** 2026-05-20  
**Status:** Approved  
**Author:** Antigravity

---

## 1. Objectives & Goals

1. **Enhance Tech Stack Showcase:**
   - Add `"GetX"` to `"Mobile (Primary)"` section in `lib/constants.ts` to highlight modern state management experience.
   - Add `"VSCode"`, `"Antigravity"`, `"Claude Code"`, and `"9router"` to `"Tools & APIs"` section in `lib/constants.ts` to showcase modern development environments and AI-native workflows.
2. **Expand AI Capabilities in Dashboard `/tech`:**
   - Add `"Antigravity"` (agentic AI pair programmer) and `"Claude Code"` (agentic CLI coder) to the AI & Automation category of the complete tech stack list in `lib/stack-data.ts`.
3. **Showcase Interactive Screenshot:**
   - Support optional project screenshots inside the `ProjectDialog` component to allow users to visually preview applications before navigating out.
   - Add a high-quality production screenshot of the TechTrend Dashboard (`/screenshots/techtrend.png`) taken from `https://www.thangvq95.page/tech` to the "ThangVQ Digital Hub" project.
4. **Point ThangVQ Digital Hub to Dashboard:**
   - Change the project card url of "ThangVQ Digital Hub" to point directly to `https://thangvq95.page/tech` instead of `https://thangvq95.page`.

---

## 2. Proposed Changes

### A. Constants Update: `lib/constants.ts`

- Add `image` as an optional property in the `PROJECTS` type.
- Add `GetX` under Mobile (Primary).
- Add `VSCode`, `Antigravity`, `Claude Code`, `9router` under Tools & APIs.
- Point "ThangVQ Digital Hub" to `/tech` and set its `image` to `"/screenshots/techtrend.png"`.

```diff
 export const TECH_STACK: { name: string; items: string[] }[] = [
   {
     name: "Mobile (Primary)",
-    items: ["Flutter", "Dart", "Riverpod", "Bloc", "Clean Architecture"],
+    items: ["Flutter", "Dart", "Riverpod", "Bloc", "GetX", "Clean Architecture"],
   },
   ...
   {
     name: "Tools & APIs",
-    items: ["Android Studio", "Figma", "Google Maps API", "Google Analytics"],
+    items: [
+      "Android Studio",
+      "VSCode",
+      "Figma",
+      "Google Maps API",
+      "Google Analytics",
+      "Antigravity",
+      "Claude Code",
+      "9router"
+    ],
   },
 ];
```

```diff
 export const PROJECTS: {
   title: string;
   description: string;
   tags: string[];
   url?: string;
   /** undefined = no stack page; "" = default (digital hub); "slug" = ?project=slug */
   stackProject?: string | null;
+  image?: string;
 }[] = [
   ...
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
-    url: "https://thangvq95.page",
+    url: "https://thangvq95.page/tech",
     stackProject: "",
+    image: "/screenshots/techtrend.png",
   },
   ...
 ];
```

### B. Complete Stack Update: `lib/stack-data.ts`

Bổ sung `"Antigravity"` và `"Claude Code"` vào nhóm `ai` (AI & Automation):

```diff
   ai: [
     {
       name: "Hermes Agent",
       ...
     },
+    {
+      name: "Antigravity",
+      icon: "robot",
+      role: "Agentic AI Developer (Gemini)",
+      category: "ai",
+      url: "https://github.com/google-gemini",
+      why: "A powerful agentic AI coding assistant from Google Deepmind pair programming with the developer.",
+    },
+    {
+      name: "Claude Code",
+      icon: "terminal",
+      role: "Agentic CLI Coding Companion",
+      category: "ai",
+      url: "https://docs.anthropic.com/en/docs/agents-and-subagents",
+      why: "Agentic developer CLI by Anthropic that runs locally for high-speed file editing and terminal command execution.",
+    },
     {
       name: "GitNexus",
       ...
     },
```

### C. Modal Dialog UI Update: `components/portfolio/ProjectDialog.tsx`

We will add a beautiful screenshot viewer under the tag list and above the main actions in `ProjectDialog.tsx`. The screenshot container will have a refined border, rounded corners, responsive aspect-ratio, and lazy-loading.

```tsx
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

---

## 3. Verification & Testing

- **Static Check & Build:** Run `npm run lint` and `npm run build` to verify that there are no compilation or TypeScript errors.
- **Visual Validation:** Ensure the project dialog displays the production screenshot beautifully under the tags and above the buttons.
- **Link Check:** Confirm that clicking the "Visit Website" button in the ThangVQ Digital Hub modal takes the user directly to the `/tech` dashboard.
