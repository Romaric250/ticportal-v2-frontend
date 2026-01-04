/**
 * Automatically prepends the current locale to a path
 * @param path - The path without locale (e.g., "/student/team" or "student/team")
 * @param locale - The current locale (from useLocale hook)
 * @returns The path with locale prefix (e.g., "/en/student/team")
 * 
 * @example
 * // In a component:
 * const locale = useLocale();
 * const path = getLocalizedPath("/student/team", locale); // Returns "/en/student/team"
 */
export function getLocalizedPath(path: string, locale: string): string {
  // Handle empty or root paths
  if (!path || path === "/") {
    return `/${locale}`;
  }
  
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // If path already starts with a locale, return as is
  if (cleanPath.startsWith("en/") || cleanPath.startsWith("fr/")) {
    return `/${cleanPath}`;
  }
  
  // Prepend locale
  return `/${locale}/${cleanPath}`;
}

