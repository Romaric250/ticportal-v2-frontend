"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import type { ComponentProps } from "react";
import { getLocalizedPath } from "../../src/utils/locale";

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/**
 * A Link component that automatically prepends the current locale to the href.
 * 
 * **Use this instead of Next.js Link for all internal navigation** to ensure locale is always included.
 * This prevents broken links when switching languages.
 * 
 * @example
 * ```tsx
 * // ✅ Good - Use LocalizedLink
 * <LocalizedLink href="/student/team">My Team</LocalizedLink>
 * // Automatically becomes: <Link href="/en/student/team">My Team</Link>
 * 
 * // ✅ Also works if locale is already included
 * <LocalizedLink href="/en/student/team">My Team</LocalizedLink>
 * // Stays as: <Link href="/en/student/team">My Team</Link>
 * 
 * // ❌ Bad - Don't use regular Link for internal routes
 * <Link href="/student/team">My Team</Link> // Will break on locale switch!
 * ```
 * 
 * **For external links**, use regular Next.js Link:
 * ```tsx
 * <Link href="https://example.com">External</Link> // No localization needed
 * ```
 */
export function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const locale = useLocale();
  const localizedHref = getLocalizedPath(href, locale);

  return <Link href={localizedHref} {...props} />;
}

