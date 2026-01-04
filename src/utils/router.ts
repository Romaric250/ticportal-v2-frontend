"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { getLocalizedPath } from "./locale";

/**
 * Custom router hook that automatically includes locale in push/replace operations
 * Use this instead of useRouter from next/navigation for internal navigation
 * 
 * @example
 * ```tsx
 * const router = useLocalizedRouter();
 * 
 * // Instead of: router.push("/student/team")
 * router.push("/student/team"); // Automatically becomes "/en/student/team"
 * ```
 */
export function useLocalizedRouter() {
  const router = useNextRouter();
  const locale = useLocale();

  return {
    ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) => {
      const localizedHref = getLocalizedPath(href, locale);
      return router.push(localizedHref, options);
    },
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) => {
      const localizedHref = getLocalizedPath(href, locale);
      return router.replace(localizedHref, options);
    },
    prefetch: (href: string, options?: Parameters<typeof router.prefetch>[1]) => {
      const localizedHref = getLocalizedPath(href, locale);
      return router.prefetch(localizedHref, options);
    },
  };
}

