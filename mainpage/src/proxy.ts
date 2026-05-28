import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
<<<<<<<< HEAD:mainpage/src/proxy.ts
import { auth } from "@/lib/auth/auth";
import { locales, defaultLocale } from "@/lib/i18n/config";
import { detectLocale } from "@/lib/i18n/detect-locale";

const MAX_BODY_SIZE = 1024 * 1024 * 5;

const PROTECTED_ROUTES = ["/account", "/file"];
const API_PROTECTED_PREFIXES = ["/api/cases", "/api/register"];
const API_PUBLIC_PREFIXES = ["/api/auth", "/api/ai", "/api/metrics", "/api/stats", "/api/track", "/api/cron", "/api/translate"];

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
].filter(Boolean);
========
import { locales, defaultLocale } from "@/lib/i18n/config";
import { detectLocale } from "@/lib/i18n/detect-locale";

const PROTECTED_ROUTES = ["/account", "/file"];
>>>>>>>> d597996f5a2dbe3edae61a08d6c9c462cecbf9d6:mainpage/src/middleware.ts

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;

    if (localeCookie && locales.includes(localeCookie as typeof locales[number])) {
      const url = request.nextUrl.clone();
      url.pathname = `/${localeCookie}${pathname}`;
      return NextResponse.redirect(url);
    }

    const acceptLanguage = request.headers.get("accept-language");
    const detectedLocale = detectLocale(acceptLanguage);

    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    const response = NextResponse.redirect(url);
    response.headers.set("X-Suggested-Locale", detectedLocale);
    return response;
  }

<<<<<<<< HEAD:mainpage/src/proxy.ts
  const isApiRoute = pathname.startsWith("/api/");

  if (isApiRoute) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    addCorsHeaders(response, request);

    const isApiProtected = API_PROTECTED_PREFIXES.some(
      (prefix) => pathname.startsWith(prefix)
    );
    const isApiPublic = API_PUBLIC_PREFIXES.some(
      (prefix) => pathname.startsWith(prefix)
    );

    if (isApiProtected && !isApiPublic && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          { ok: false, error: "Authentication required" },
          { status: 401 }
        );
      }
========
  const pathnameWithoutLocale = pathname.replace(
    new RegExp(`^/(${locales.join("|")})`),
    ""
  ) || "/";

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (prefix) => pathnameWithoutLocale === prefix || pathnameWithoutLocale.startsWith(`${prefix}/`)
  );

  const response = NextResponse.next();

  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get("next-auth.session-token")?.value;
    if (!sessionCookie) {
      const signInUrl = new URL("/auth/verify", request.url);
      signInUrl.searchParams.set("callbackUrl", pathnameWithoutLocale);
      return NextResponse.redirect(signInUrl);
>>>>>>>> d597996f5a2dbe3edae61a08d6c9c462cecbf9d6:mainpage/src/middleware.ts
    }

    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      const contentLength = request.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
        return NextResponse.json(
          { ok: false, error: "Request body too large" },
          { status: 413 }
        );
      }
    }

    return response;
  }

<<<<<<<< HEAD:mainpage/src/proxy.ts
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
    const acceptLanguage = request.headers.get("accept-language");
    const detectedLocale = detectLocale(acceptLanguage, localeCookie);

    const url = request.nextUrl.clone();
    url.pathname = `/${detectedLocale}${pathname}`;
    const redirectResponse = NextResponse.redirect(url);
    addSecurityHeaders(redirectResponse);
    addCorsHeaders(redirectResponse, request);
    return redirectResponse;
  }

  const pathnameWithoutLocale = pathnameHasLocale
    ? pathname.replace(new RegExp(`^/(${locales.join("|")})`), "") || "/"
    : pathname;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (prefix) => pathnameWithoutLocale === prefix || pathnameWithoutLocale.startsWith(`${prefix}/`)
  );

  const response = NextResponse.next();
  addSecurityHeaders(response);
  addCorsHeaders(response, request);

  if (isProtectedRoute) {
    const session = await auth();
    if (!session?.user?.id) {
      const signInUrl = new URL("/auth/verify", request.url);
      signInUrl.searchParams.set("callbackUrl", pathnameWithoutLocale);
      return NextResponse.redirect(signInUrl);
    }
  }

========
>>>>>>>> d597996f5a2dbe3edae61a08d6c9c462cecbf9d6:mainpage/src/middleware.ts
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|api/|.*\\..*).*)",
  ],
};
