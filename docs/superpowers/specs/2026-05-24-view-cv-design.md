# Design Spec: View CV Functionality Update

**Date:** 2026-05-24  
**Author:** Antigravity  
**Status:** Approved  
**Topic:** Change "Download CV" to "View CV" and open the resume PDF in a new browser tab natively.

---

## 1. Problem Statement & Goals
- **Objective:** Change the portfolio button from "Download CV" to "View CV".
- **User Experience:** When clicked, the button should open a new tab containing the user's PDF resume (`resume.pdf`). 
- **Download Capability:** Modern web browsers' built-in PDF viewer will naturally host the viewing experience and allow direct downloading of the PDF.

---

## 2. Proposed Design (Option A)
- **Asset:** The resume PDF file `/public/resume.pdf` is served statically.
- **UI Update:** In `/components/portfolio/HeroSection.tsx`:
  - Change the label of the second button from `"Download CV"` to `"View CV"`.
  - The `href` will remain `"/resume.pdf"`.
  - Ensure the link is configured with `target="_blank"` and `rel="noopener noreferrer"` attributes to open in a new tab.

---

## 3. Detailed Changes

### File: `/components/portfolio/HeroSection.tsx`
```diff
           <a
             href="/resume.pdf"
             id="hero-download-cv"
             target="_blank"
             rel="noopener noreferrer"
             className="px-8 py-3 rounded-full font-medium glass transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
             style={{ color: "var(--text-primary)", border: "1px solid var(--border)" }}
           >
-            Download CV
+            View CV
           </a>
```

---

## 4. Verification Plan

### Manual Verification
1. Open the local development website at `http://localhost:3002`.
2. Inspect the secondary button in the Hero section:
   - Ensure the label text is **"View CV"**.
   - Check that clicking the button opens the PDF `/resume.pdf` in a new tab.
   - Confirm that the PDF file loads properly and allows downloading.

### CI/Build Verification
1. Run `npm run lint` to verify that there are no lint issues.
2. Run `npm run build` to ensure the project builds correctly with the new file and changes.
