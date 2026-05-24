import { Redis } from "@upstash/redis";
import { db } from "@/lib/db/client";
import { entityMetricsSnapshots, shareClickEvents, companies, cases } from "@/lib/db/schema";
import { eq, and, count, gte, sql } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";

const ALLOWED_ENTITY_TYPES = ["company", "case", "timeline_event"] as const;

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

const CACHE_TTL = 300;

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const { allowed } = rateLimit(`metrics:${ip}`, 60, 60_000);
  if (!allowed) return error("Too many requests", 429);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!type || !id) return error("Missing required parameters: type and id", 400);
  if (!ALLOWED_ENTITY_TYPES.includes(type as any)) return error("Invalid entity type", 400);

  const cacheKey = `metrics:${type}:${id}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return success(cached);
    } catch { /* fall through */ }
  }

  try {
    const data = type === "company"
      ? await getCompanyMetrics(id)
      : await getEntityMetrics(type, id);

    if (redis) {
      try { await redis.setex(cacheKey, CACHE_TTL, data); } catch { /* ok */ }
    }

    return success(data);
  } catch (err) {
    console.error("Failed to fetch metrics:", err);
    return error("Failed to fetch metrics", 500);
  }
}

async function getEntityMetrics(type: string, id: string) {
  const [snapshot] = await db
    .select()
    .from(entityMetricsSnapshots)
    .where(and(eq(entityMetricsSnapshots.entityType, type), eq(entityMetricsSnapshots.entityId, id)))
    .limit(1);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [shareCount] = await db
    .select({ total: count() })
    .from(shareClickEvents)
    .where(and(eq(shareClickEvents.entityType, type), eq(shareClickEvents.entityId, id), gte(shareClickEvents.createdAt, oneDayAgo)));

  return snapshot
    ? {
        viewsTotal: snapshot.viewsTotal,
        views24h: snapshot.views24h,
        views7d: snapshot.views7d,
        sharesTotal: snapshot.sharesTotal + shareCount.total,
        visitorsTotal: snapshot.visitorsTotal,
        visitors24h: snapshot.visitors24h,
        visitors7d: snapshot.visitors7d,
        lastUpdatedAt: snapshot.lastSyncedAt,
      }
    : {
        viewsTotal: 0,
        views24h: 0,
        views7d: 0,
        sharesTotal: shareCount.total,
        visitorsTotal: 0,
        visitors24h: 0,
        visitors7d: 0,
        lastUpdatedAt: null,
      };
}

async function getCompanyMetrics(slug: string) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get the company's own page metrics snapshot
  const [companySnapshot] = await db
    .select()
    .from(entityMetricsSnapshots)
    .where(and(eq(entityMetricsSnapshots.entityType, "company"), eq(entityMetricsSnapshots.entityId, slug)))
    .limit(1);

  // Look up company UUID from slug
  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.slug, slug))
    .limit(1);

  let caseAgg = {
    viewsTotal: 0,
    views24h: 0,
    views7d: 0,
    sharesTotal: 0,
    visitorsTotal: 0,
    visitors24h: 0,
    visitors7d: 0,
  };

  if (company) {
    // Aggregate all case metrics for cases belonging to this company
    // Use raw SQL to handle the varchar::uuid cast for the join
    const result = await db.execute<{
      views_total: string;
      views_24h: string;
      views_7d: string;
      shares_total: string;
      visitors_total: string;
      visitors_24h: string;
      visitors_7d: string;
    }>(
      sql`
        SELECT
          COALESCE(SUM(ems.views_total), 0)::text as views_total,
          COALESCE(SUM(ems.views_24h), 0)::text as views_24h,
          COALESCE(SUM(ems.views_7d), 0)::text as views_7d,
          COALESCE(SUM(ems.shares_total), 0)::text as shares_total,
          COALESCE(SUM(ems.visitors_total), 0)::text as visitors_total,
          COALESCE(SUM(ems.visitors_24h), 0)::text as visitors_24h,
          COALESCE(SUM(ems.visitors_7d), 0)::text as visitors_7d
        FROM entity_metrics_snapshots ems
        INNER JOIN cases c ON ems.entity_id::uuid = c.id
        WHERE ems.entity_type = 'case'
        AND c.company_id = ${company.id}
      `
    );
    const caseMetrics = result.rows?.[0];

    caseAgg = {
      viewsTotal: Number(caseMetrics?.views_total ?? 0),
      views24h: Number(caseMetrics?.views_24h ?? 0),
      views7d: Number(caseMetrics?.views_7d ?? 0),
      sharesTotal: Number(caseMetrics?.shares_total ?? 0),
      visitorsTotal: Number(caseMetrics?.visitors_total ?? 0),
      visitors24h: Number(caseMetrics?.visitors_24h ?? 0),
      visitors7d: Number(caseMetrics?.visitors_7d ?? 0),
    };
  }

  // Check for local share clicks on the company page (24h)
  const [companyShareCount] = await db
    .select({ total: count() })
    .from(shareClickEvents)
    .where(and(eq(shareClickEvents.entityType, "company"), eq(shareClickEvents.entityId, slug), gte(shareClickEvents.createdAt, oneDayAgo)));

  return {
    viewsTotal: (companySnapshot?.viewsTotal ?? 0) + caseAgg.viewsTotal,
    views24h: (companySnapshot?.views24h ?? 0) + caseAgg.views24h,
    views7d: (companySnapshot?.views7d ?? 0) + caseAgg.views7d,
    sharesTotal: (companySnapshot?.sharesTotal ?? 0) + caseAgg.sharesTotal + companyShareCount.total,
    visitorsTotal: (companySnapshot?.visitorsTotal ?? 0) + caseAgg.visitorsTotal,
    visitors24h: (companySnapshot?.visitors24h ?? 0) + caseAgg.visitors24h,
    visitors7d: (companySnapshot?.visitors7d ?? 0) + caseAgg.visitors7d,
    lastUpdatedAt: companySnapshot?.lastSyncedAt ?? null,
  };
}
