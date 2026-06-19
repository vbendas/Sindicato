import { db } from "@/lib/db/client";
import { cases, companies, caseTags } from "@/lib/db/schema";
import { eq, sql, count, sum, and, ne } from "drizzle-orm";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";
import { getTagSeverity, type TagSeverity } from "@/lib/ai/tag-taxonomy";

export const revalidate = 120;

type Vertical = "remote" | "gig";

function verticalWhere(vertical?: Vertical | null) {
  return vertical ? eq(cases.vertical, vertical) : undefined;
}

async function getStats(vertical?: Vertical | null) {
  const vw = verticalWhere(vertical);

  const conditions = [ne(cases.status, "deleted")];
  if (vw) conditions.push(vw);

  const activeConditions = [eq(cases.status, "active")];
  if (vw) activeConditions.push(vw);

  const solicitorConditions = [eq(cases.optInSolicitor, true), ne(cases.status, "deleted")];
  if (vw) solicitorConditions.push(vw);

  const resolvedConditions = [eq(cases.status, "resolved")];
  if (vw) resolvedConditions.push(vw);

  const companyWhere = [ne(cases.status, "deleted")];
  if (vw) companyWhere.push(vw);

  const topTagConditions = [ne(cases.status, "deleted")];
  if (vw) topTagConditions.push(vw);

  const [
    [totalCasesRow],
    [totalUnpaidRow],
    unpaidByCurrency,
    [activeCompaniesRow],
    [workersLegalRow],
    [casesResolvedRow],
    companyStats,
    topTagRows,
  ] = await Promise.all([
    db.select({ total: count() }).from(cases).where(and(...conditions)),
    db.select({ total: sum(cases.amountOwed) }).from(cases).where(and(...activeConditions)),
    db
      .select({ currency: cases.currency, total: sum(cases.amountOwed) })
      .from(cases)
      .where(and(...activeConditions))
      .groupBy(cases.currency),
    db
      .select({ total: sql<number>`COUNT(DISTINCT ${cases.companyId})` })
      .from(cases)
      .where(and(...activeConditions)),
    db.select({ total: count() }).from(cases).where(and(...solicitorConditions)),
    db.select({ total: count() }).from(cases).where(and(...resolvedConditions)),
    db
      .select({
        companyId: cases.companyId,
        companySlug: companies.slug,
        companyName: companies.name,
        vertical: companies.vertical,
        caseCount: count(),
        totalUnpaid: sum(cases.amountOwed),
      })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(and(...companyWhere))
      .groupBy(cases.companyId, companies.slug, companies.name, companies.vertical),
    db
      .select({
        tagName: caseTags.tagName,
        cnt: sql<number>`COUNT(*)`,
      })
      .from(caseTags)
      .innerJoin(cases, eq(caseTags.caseId, cases.id))
      .where(and(...topTagConditions))
      .groupBy(caseTags.tagName)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(5),
  ]);

  return {
    totalCases: totalCasesRow?.total ?? 0,
    totalUnpaid: Number(totalUnpaidRow?.total ?? 0),
    unpaidByCurrency: unpaidByCurrency.map((r) => ({
      currency: r.currency,
      total: Number(r.total ?? 0),
    })),
    activeCompanies: activeCompaniesRow?.total ?? 0,
    workersLegal: workersLegalRow?.total ?? 0,
    casesResolved: casesResolvedRow?.total ?? 0,
    topTags: topTagRows.map((row) => ({
      tagName: row.tagName,
      severity: getTagSeverity(row.tagName) as TagSeverity,
      count: row.cnt,
    })),
    companies: companyStats.map((c) => ({
      slug: c.companySlug,
      name: c.companyName,
      vertical: c.vertical,
      caseCount: c.caseCount,
      totalUnpaid: Number(c.totalUnpaid ?? 0),
    })),
  };
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = await rateLimit(`stats:${ip}`, 30, 60_000);
  if (!allowed) return error("Too many requests", 429);

  const responseHeaders = {
    "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
  };

  try {
    const { searchParams } = new URL(request.url);
    const vertical = (searchParams.get("vertical") as Vertical | null) || null;

    if (vertical) {
      const mainStats = await getStats(vertical);
      return success(mainStats, 200);
    }

    const [mainStats, remoteStats, gigStats] = await Promise.all([
      getStats(),
      getStats("remote"),
      getStats("gig"),
    ]);

    const data = {
      ...mainStats,
      verticals: {
        remote: remoteStats,
        gig: gigStats,
      },
    };

    return success(data, 200);
  } catch (err) {
    console.error("Error fetching stats:", err);
    return error("Failed to fetch stats", 500);
  }
}
