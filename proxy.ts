import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, locales } from "./src/i18n/request";

const intlProxy = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect /en/* to /fr/* (force French as default)
  if (pathname.startsWith("/en/") || pathname === "/en") {
    const newPath = pathname.replace(/^\/en/, "/fr");
    return NextResponse.redirect(new URL(newPath, request.url));
  }
  
  // Locale handling (e.g. / -> /fr, /student -> /fr/student)
  const response = intlProxy(request);

  // Note: Authentication is handled client-side via tokenStorage (localStorage)
  // The middleware cannot access localStorage, so we don't check auth here.
  // Auth checks happen in the dashboard layout component.

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};


