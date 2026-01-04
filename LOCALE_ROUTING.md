# Locale-Aware Routing Guide

This guide explains how to handle locale-aware routing in the TIC Portal to ensure all links work correctly when switching between languages.

## Quick Start

**Always use `LocalizedLink` for internal navigation instead of Next.js `Link`:**

```tsx
import { LocalizedLink } from "@/components/ui/LocalizedLink";

// ✅ Good - Automatically includes locale
<LocalizedLink href="/student/team">My Team</LocalizedLink>
// Becomes: <Link href="/en/student/team">My Team</Link>

// ❌ Bad - Will break on locale switch
<Link href="/student/team">My Team</Link>
```

## Components

### 1. LocalizedLink Component

A drop-in replacement for Next.js `Link` that automatically prepends the current locale.

**Location:** `components/ui/LocalizedLink.tsx`

**Usage:**
```tsx
import { LocalizedLink } from "@/components/ui/LocalizedLink";

// Simple link
<LocalizedLink href="/student/team">My Team</LocalizedLink>

// With all Link props
<LocalizedLink 
  href="/student/portfolio" 
  className="text-blue-600"
  onClick={handleClick}
>
  Portfolio
</LocalizedLink>
```

**Features:**
- Automatically adds locale prefix (e.g., `/en` or `/fr`)
- Works even if locale is already in the path
- Supports all Next.js Link props
- No manual locale handling needed

### 2. useLocalizedRouter Hook

A custom router hook for programmatic navigation that automatically includes locale.

**Location:** `src/utils/router.ts`

**Usage:**
```tsx
import { useLocalizedRouter } from "@/src/utils/router";

function MyComponent() {
  const router = useLocalizedRouter();
  
  const handleClick = () => {
    // Automatically becomes "/en/student/team"
    router.push("/student/team");
  };
  
  return <button onClick={handleClick}>Go to Team</button>;
}
```

### 3. getLocalizedPath Utility

A utility function to manually get localized paths (rarely needed).

**Location:** `src/utils/locale.ts`

**Usage:**
```tsx
import { getLocalizedPath } from "@/src/utils/locale";
import { useLocale } from "next-intl";

function MyComponent() {
  const locale = useLocale();
  const path = getLocalizedPath("/student/team", locale);
  // Returns: "/en/student/team"
}
```

## Migration Guide

### Before (Manual Locale Handling)
```tsx
import Link from "next/link";
import { useLocale } from "next-intl";

function MyComponent() {
  const locale = useLocale();
  
  return (
    <Link href={`/${locale}/student/team`}>
      My Team
    </Link>
  );
}
```

### After (Automatic Locale Handling)
```tsx
import { LocalizedLink } from "@/components/ui/LocalizedLink";

function MyComponent() {
  return (
    <LocalizedLink href="/student/team">
      My Team
    </LocalizedLink>
  );
}
```

## Best Practices

1. **Always use `LocalizedLink` for internal routes:**
   ```tsx
   // ✅ Good
   <LocalizedLink href="/student/team">Team</LocalizedLink>
   
   // ❌ Bad
   <Link href="/student/team">Team</Link>
   ```

2. **Use regular `Link` only for external URLs:**
   ```tsx
   // ✅ Good - External links don't need localization
   <Link href="https://example.com">External Site</Link>
   ```

3. **Use `useLocalizedRouter` for programmatic navigation:**
   ```tsx
   // ✅ Good
   const router = useLocalizedRouter();
   router.push("/student/team");
   
   // ❌ Bad
   const router = useRouter();
   router.push(`/${locale}/student/team`);
   ```

4. **Dynamic routes work automatically:**
   ```tsx
   // ✅ Works with dynamic segments
   <LocalizedLink href={`/student/course/${courseId}`}>
     View Course
   </LocalizedLink>
   ```

## Examples

### Navigation Menu
```tsx
import { LocalizedLink } from "@/components/ui/LocalizedLink";

const navItems = [
  { href: "/student", label: "Overview" },
  { href: "/student/team", label: "My Team" },
  { href: "/student/portfolio", label: "Portfolio" },
];

function Navigation() {
  return (
    <nav>
      {navItems.map((item) => (
        <LocalizedLink key={item.href} href={item.href}>
          {item.label}
        </LocalizedLink>
      ))}
    </nav>
  );
}
```

### Button with Navigation
```tsx
import { useLocalizedRouter } from "@/src/utils/router";

function ActionButton() {
  const router = useLocalizedRouter();
  
  return (
    <button onClick={() => router.push("/student/team")}>
      Go to Team
    </button>
  );
}
```

### Breadcrumbs
```tsx
import { LocalizedLink } from "@/components/ui/LocalizedLink";

function Breadcrumbs() {
  return (
    <nav>
      <LocalizedLink href="/student">Home</LocalizedLink>
      <span> / </span>
      <LocalizedLink href="/student/team">Team</LocalizedLink>
      <span> / </span>
      <span>Deliverables</span>
    </nav>
  );
}
```

## Testing

When testing locale switching:
1. Navigate to any page
2. Switch language using the locale toggle
3. Verify all links still work correctly
4. Check that the URL includes the correct locale prefix

## Troubleshooting

**Problem:** Links break when switching languages

**Solution:** Make sure you're using `LocalizedLink` instead of regular `Link` for internal routes.

**Problem:** Double locale in URL (e.g., `/en/en/student`)

**Solution:** The `getLocalizedPath` function automatically detects if locale is already present. If this happens, check that you're not manually adding locale when using `LocalizedLink`.

## Summary

- ✅ Use `LocalizedLink` for all internal navigation
- ✅ Use `useLocalizedRouter` for programmatic navigation
- ✅ Use regular `Link` only for external URLs
- ❌ Don't manually add locale to paths
- ❌ Don't use regular `Link` for internal routes

This ensures all links work correctly regardless of the current locale!

