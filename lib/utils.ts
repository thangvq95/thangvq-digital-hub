export function sanitizeStarsGrowth(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/.*?\/svg>\s*/, "");
}

/**
 * Build the internal /stack URL for a project.
 * Returns null when stackProject is null/undefined (no stack page).
 * Returns "/stack" when stackProject is "" (default: digital hub).
 * Returns "/stack?project=<encoded>" otherwise.
 */
export function buildStackUrl(
  stackProject: string | null | undefined,
): string | null {
  if (stackProject === null || stackProject === undefined) return null;
  if (stackProject === "") return "/stack";
  return `/stack?project=${encodeURIComponent(stackProject)}`;
}
