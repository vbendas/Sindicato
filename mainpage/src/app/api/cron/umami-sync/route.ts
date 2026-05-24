import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { companies, cases, caseTimelineEvents, shareClickEvents } from "@/lib/db/schema";
import { umamiClient } from "@/lib/umami/client";
import { eq, and, gte } from "drizzle-orm";

const CRON_SECRET = process.env.CRON_SECRET;

interface SyncEntity {
  entityType: "company" | "case" | "timeline_event";
  entityId: string;
  path: string;
}

function buildEntityPath(entityType: string, item: { id: string; vertical?: string | null; slug?: string | null }): string {
  if (entityType === "company") {
    const vertical = item.vertical || "remote";
    const slug = item.slug || item.id;
    return vertical === "gig" ? `/gig/${slug}` : `/workers/${slug}`;
  }
  return `/cases/${item.id}`;
}

async function collectEntities(): Promise<SyncEntity[]> {
  const entities: SyncEntity[] = [];

  const allCompanies = await db
    .select({ id: companies.id, slug: companies.slug, vertical: companies.vertical })
    .from(companies);

  for (const c of allCompanies) {
    entities.push({ entityType: "company", entityId: c.id, path: buildEntityPath("company", c) });
  }

  const allCases = await db.select({ id: cases.id }).from(cases).where(eq(cases.status, "active"));
  for (const c of allCases) {
    entities.push({ entityType: "case", entityId: c.id, path: buildEntityPath("case", c) });
  }

  const allEvents = await db.select({ id: caseTimelineEvents.id }).from(caseTimelineEvents);
  for (const e of allEvents) {
    entities.push({ entityType: "timeline_event", entityId: e.id, path: `/cases/${e.id}` });
  }

  return entities;
}

async function syncEntity(entity: SyncEntity): Promise<void> {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * ONE_DAY;
  const THIRTY_DAYS = 30 * ONE_DAY;

  const [total, last7d, last24h] = await Promise.all([
    umamiClient.getStats(entity.path, now - THIRTY_DAYS, now),
    umamiClient.getStats(entity.path, now - SEVEN_DAYS, now),
    umamiClient.getStats(entity.path, now - ONE_DAY, now),
  ]);

  const shareCount = await umamiClient.getEventCount("share_click", now - THIRTY_DAYS, now);

  await umamiClient.updateMetricsSnapshot(
    entity.entityType,
    entity.entityId,
    total.pageviews,
    last24h.pageviews,
    last7d.pageviews,
    total.visitors,
    last24h.visitors,
    last7d.visitors,
    shareCount,
  );
}

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 1000;

export async function GET(req: NextRequest) {
  if (CRON_SECRET) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const entities = await collectEntities();
    let synced = 0;
    let errors = 0;

    for (let i = 0; i < entities.length; i += BATCH_SIZE) {
      const batch = entities.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map((entity) => syncEntity(entity)));

      for (const result of results) {
        if (result.status === "fulfilled") synced++;
        else {
          errors++;
          console.error("Sync error:", result.reason);
        }
      }

      if (i + BATCH_SIZE < entities.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    return Response.json({
      success: true,
      message: "Umami sync completed",
      stats: { total: entities.length, synced, errors },
    });
  } catch (error) {
    console.error("Umami sync failed:", error);
    return Response.json({ success: false, message: "Sync failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
