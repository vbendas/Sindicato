import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, sql, count, sum, and, ne } from "drizzle-orm";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";

type Vertical = "remote" | "gig";

function verticalWhere(vertical?: Vertical | null) {
  return vertical ? eq(cases.vertical, vertical) : undefined;
}

async function getStats(vertical?: Vertical | null) {
  const vw = verticalWhere(vertical);

  const conditions = [ne(cases.status, "deleted")];
  if (vw) conditions.push(vw);

  const [totalCasesRow] = await db
    .select({ total: count() })
    .from(cases)
    .where(and(...conditions));

  const activeConditions = [eq(cases.status, "active")];
  if (vw) activeConditions.push(vw);

  const [totalUnpaidRow] = await db
    .select({ total: sum(cases.amountOwed) })
    .from(cases)
    .where(and(...activeConditions));

  const unpaidByCurrency = await db
    .select({
      currency: cases.currency,
      total: sum(cases.amountOwed),
    })
    .from(cases)
    .where(and(...activeConditions))
    .groupBy(cases.currency);

  const [activeCompaniesRow] = await db
    .select({ total: sql<number>`COUNT(DISTINCT ${cases.companyId})` })
    .from(cases)
    .where(and(...activeConditions));

  const solicitorConditions = [eq(cases.optInSolicitor, true), ne(cases.status, "deleted")];
  if (vw) solicitorConditions.push(vw);

  const [workersLegalRow] = await db
    .select({ total: count() })
    .from(cases)
    .where(and(...solicitorConditions));

  const resolvedConditions = [eq(cases.status, "resolved")];
  if (vw) resolvedConditions.push(vw);

  const [casesResolvedRow] = await db
    .select({ total: count() })
    .from(cases)
    .where(and(...resolvedConditions));

  const companyWhere = [ne(cases.status, "deleted")];
  if (vw) companyWhere.push(vw);

  const companyStats = await db
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
    .groupBy(cases.companyId, companies.slug, companies.name, companies.vertical);

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
    "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
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
