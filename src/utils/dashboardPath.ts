/**
 * Default dashboard path after login (leading slash, after locale).
 * Keeps login + layout redirects consistent for mentor/judge vs student.
 */
export function getDashboardPathForRole(role: string | null | undefined): string {
  const r = (role ?? "student").toLowerCase().replace(/_/g, "-");
  if (r === "admin" || r === "super-admin") return `/${r}`;
  if (r === "affiliate") return "/affiliate";
  if (r === "mentor") return "/mentor/tic-feed";
  if (r === "judge") return "/judge";
  return "/student";
}
