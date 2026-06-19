import { lookup } from "node:dns/promises";
import net from "node:net";

const BLOCKED_RANGES: Array<{ start: string; end: string }> = [
  { start: "0.0.0.0", end: "0.255.255.255" },
  { start: "10.0.0.0", end: "10.255.255.255" },
  { start: "100.64.0.0", end: "100.127.255.255" },
  { start: "127.0.0.0", end: "127.255.255.255" },
  { start: "169.254.0.0", end: "169.254.255.255" },
  { start: "172.16.0.0", end: "172.31.255.255" },
  { start: "192.168.0.0", end: "192.168.255.255" },
  { start: "198.18.0.0", end: "198.19.255.255" },
  { start: "224.0.0.0", end: "239.255.255.255" },
  { start: "240.0.0.0", end: "255.255.255.255" },
];

function ipToInt(ip: string): number | null {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
  return parts.reduce((acc, oct) => acc * 256 + oct, 0);
}

function isBlockedIp(ip: string): boolean {
  const val = ipToInt(ip);
  if (val === null) return false;
  return BLOCKED_RANGES.some((r) => {
    const start = ipToInt(r.start)!;
    const end = ipToInt(r.end)!;
    return val >= start && val <= end;
  });
}

export async function isUrlSafe(rawUrl: string): Promise<{ safe: boolean; reason?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { safe: false, reason: "invalid URL" };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { safe: false, reason: "non-http(s) scheme" };
  }

  const hostname = parsed.hostname;

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return { safe: false, reason: "localhost" };
  }

  if (hostname === "[::1]" || hostname === "::1") {
    return { safe: false, reason: "IPv6 loopback" };
  }

  if (net.isIP(hostname) > 0) {
    return { safe: !isBlockedIp(hostname), reason: isBlockedIp(hostname) ? "blocked IP" : undefined };
  }

  try {
    const addresses = await lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isBlockedIp(addr.address)) {
        return { safe: false, reason: `resolves to blocked IP ${addr.address}` };
      }
    }
    return { safe: true };
  } catch {
    return { safe: false, reason: "DNS lookup failed" };
  }
}
