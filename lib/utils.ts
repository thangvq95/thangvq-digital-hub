export function sanitizeStarsGrowth(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/[\s\S]*?<\/svg>\s*/, "");
}
