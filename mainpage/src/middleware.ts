import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";
import { detectLocale } from "@/lib/i18n/detect-locale";

const PROTECTED_ROUTES = ["/account", "/file"];

export async function middleware(request: NextRequest) {
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
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|api/|.*\\..*).*)",
  ],
};
