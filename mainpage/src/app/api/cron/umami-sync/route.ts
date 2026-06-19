import { NextRequest } from "next/server";
import { verifyBearerSecret } from "@/lib/utils/api";

const NO_CACHE_HEADERS = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function GET(req: NextRequest) {
  if (!verifyBearerSecret(req.headers.get("Authorization"), process.env.CRON_SECRET)) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  // Per-URL stats now come from self-hosted /api/track/pageview endpoint.
  // Umami Cloud API v1 ignores URL filtering, returning total website stats for every query.
  // This cron is kept as a no-op to avoid breaking the Vercel cron schedule.
  return Response.json({
    success: true,
    message: "Umami sync disabled — per-URL tracking is handled by /api/track/pageview",
    stats: { total: 0, synced: 0, errors: 0 },
  }, { headers: NO_CACHE_HEADERS });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
