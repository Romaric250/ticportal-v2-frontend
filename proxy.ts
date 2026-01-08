import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, locales } from "./src/i18n/request";

const intlProxy = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export default function proxy(request: NextRequest) {
  // Locale handling (e.g. / -> /en, /student -> /en/student)
  const response = intlProxy(request);

  // Note: Authentication is handled client-side via tokenStorage (localStorage)
  // The middleware cannot access localStorage, so we don't check auth here.
  // Auth checks happen in the dashboard layout component.

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};


