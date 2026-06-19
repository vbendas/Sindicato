import { db } from "@/lib/db/client";
import { entityMetricsSnapshots } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { error, success, getClientIp, verifyBearerSecret } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = await rateLimit(`reset-metrics:${ip}`, 5, 60_000);
  if (!allowed) return error("Too many requests", 429);

  if (!verifyBearerSecret(request.headers.get("Authorization"), process.env.CRON_SECRET)) {
    return error("Unauthorized", 401);
  }

  try {
    await db
      .update(entityMetricsSnapshots)
      .set({
        viewsTotal: 0,
        views24h: 0,
        views7d: 0,
        sharesTotal: 0,
        visitorsTotal: 0,
        visitors24h: 0,
        visitors7d: 0,
        lastSyncedAt: new Date(),
      });

    return success({ reset: true, message: "All metrics reset to 0" });
  } catch (err) {
    console.error("Failed to reset metrics:", err);
    return error("Failed to reset metrics", 500);
  }
}
