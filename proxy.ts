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

  const { pathname } = request.nextUrl;

  const isDashboardRoute =
    pathname.startsWith("/student") ||
    pathname.startsWith("/mentor") ||
    pathname.startsWith("/judge") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super-admin");

  // Simple protected-route scaffold; backend should set `tp_auth` httpOnly cookie.
  const hasAuthCookie = request.cookies.get("tp_auth");

  if (isDashboardRoute && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};


