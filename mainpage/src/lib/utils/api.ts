import { NextResponse } from "next/server";

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function error(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { ok: false, error: message, ...(details ? { details } : {}) },
    { status }
  );
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    if (ips.length > 0) return ips[ips.length - 1];
  }
  return request.headers.get("cf-connecting-ip") ?? "unknown";
}
