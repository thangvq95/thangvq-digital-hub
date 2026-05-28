export function sanitizeStarsGrowth(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/[\s\S]*?<\/svg>\s*/, "");
}

/**
 * Build the internal /stack URL for a project.
 * Returns null when stackProject is null/undefined (no stack page).
 * Returns "/tech" when stackProject is "" (default: digital hub).
 * Returns "/stack" otherwise.
 */
export function buildStackUrl(
  stackProject: string | null | undefined,
): string | null {
  if (stackProject === null || stackProject === undefined) return null;
  if (stackProject === "") return "/tech";
  return "/stack";
}
