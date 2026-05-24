import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

const MAX_BODY_SIZE = 1024 * 1024 * 5;

const PROTECTED_ROUTES = ["/account", "/file", "/clerk"];
const API_PROTECTED_PREFIXES = ["/api/cases", "/api/clerk/query", "/api/register"];
const API_PUBLIC_PREFIXES = ["/api/auth", "/api/ai", "/api/metrics", "/api/stats", "/api/track", "/api/cron"];

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
].filter(Boolean);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    addCorsHeaders(response, request);
    return response;
  }

  const response = NextResponse.next();

  addSecurityHeaders(response);
  addCorsHeaders(response, request);

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isApiProtected = API_PROTECTED_PREFIXES.some(
    (prefix) => pathname.startsWith(prefix)
  );

  const isApiPublic = API_PUBLIC_PREFIXES.some(
    (prefix) => pathname.startsWith(prefix)
  );

  const isApiRoute = pathname.startsWith("/api/");

  if (isProtectedRoute || (isApiProtected && !isApiPublic)) {
    const session = await auth();
    if (!session?.user?.id) {
      if (isApiRoute) {
        return NextResponse.json(
          { ok: false, error: "Authentication required" },
          { status: 401 }
        );
      }
      const signInUrl = new URL("/auth/verify", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (isApiRoute && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
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

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
}

function addCorsHeaders(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Forwarded-For");
    response.headers.set("Access-Control-Max-Age", "86400");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|.*\\..*).*)",
    "/api/:path*",
  ],
};
