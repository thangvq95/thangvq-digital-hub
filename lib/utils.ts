export function sanitizeStarsGrowth(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/.*?\/svg>\s*/, "");
}
