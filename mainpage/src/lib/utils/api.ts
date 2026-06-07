import { NextResponse } from "next/server";

export function success<T>(data: T, status = 200, headers?: Record<string, string>) {
  return NextResponse.json({ ok: true, data }, { status, headers });
}

export function error(message: string, status = 400, details?: unknown, headers?: Record<string, string>) {
  return NextResponse.json(
    { ok: false, error: message, ...(details ? { details } : {}) },
    { status, headers }
  );
}

export function getClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    if (ips.length > 0) return ips[0];
  }
  return "unknown";
}
