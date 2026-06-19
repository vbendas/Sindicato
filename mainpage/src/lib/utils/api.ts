import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export function success<T>(data: T, status = 200, headers?: Record<string, string>) {
  return NextResponse.json({ ok: true, data }, { status, headers });
}

export function error(message: string, status = 400, details?: unknown, headers?: Record<string, string>) {
  return NextResponse.json(
    { ok: false, error: message, ...(details ? { details } : {}) },
    { status, headers }
  );
}

export function verifyBearerSecret(
  authHeader: string | null,
  secret: string | undefined
): boolean {
  if (!secret || !authHeader) return false;
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(authHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfRay = request.headers.get("cf-ray");
  if (cfRay) {
    const cfIp = request.headers.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    if (ips.length > 0) return ips[ips.length - 1];
  }
  return "unknown";
}
