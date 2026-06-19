import { db } from "@/lib/db/client";
import { entityMetricsSnapshots, companies, cases } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { error, success, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";

const ALLOWED_ENTITY_TYPES = ["company", "case", "timeline_event"];

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = await rateLimit(`pageview:${ip}`, 60, 60_000);
  if (!allowed) return error("Too many requests", 429);

  try {
    const body = await request.json();
    const { entityType, entityId } = body;

    if (!entityType || !entityId) {
      return error("Missing required fields: entityType, entityId", 400);
    }

    if (!ALLOWED_ENTITY_TYPES.includes(entityType)) {
      return error("Invalid entityType", 400);
    }

    // Validate entityId exists before tracking
    if (entityType === "company") {
      const [exists] = await db.select({ id: companies.id }).from(companies).where(eq(companies.id, entityId)).limit(1);
      if (!exists) return success({ recorded: true });
    } else if (entityType === "case") {
      const [exists] = await db.select({ id: cases.id }).from(cases).where(eq(cases.id, entityId)).limit(1);
      if (!exists) return success({ recorded: true });
    }

    // Atomic upsert using ON CONFLICT DO UPDATE
    await db.insert(entityMetricsSnapshots)
      .values({
        entityType,
        entityId,
        viewsTotal: 1,
        views24h: 1,
        views7d: 1,
        sharesTotal: 0,
        visitorsTotal: 1,
        visitors24h: 1,
        visitors7d: 1,
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [entityMetricsSnapshots.entityType, entityMetricsSnapshots.entityId],
        set: {
          viewsTotal: sql`${entityMetricsSnapshots.viewsTotal} + 1`,
          lastSyncedAt: new Date(),
        },
      });

    return success({ recorded: true });
  } catch (err) {
    console.error("Failed to record pageview:", err);
    return error("Failed to record pageview", 500);
  }
}
