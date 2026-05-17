import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, sql, count, sum, and, ne } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";

export async function GET() {
  try {
    const [totalCasesRow] = await db
      .select({ total: count() })
      .from(cases)
      .where(ne(cases.status, "deleted"));

    const [totalUnpaidRow] = await db
      .select({
        total: sum(cases.amountOwed),
      })
      .from(cases)
      .where(eq(cases.status, "active"));

    const unpaidByCurrency = await db
      .select({
        currency: cases.currency,
        total: sum(cases.amountOwed),
      })
      .from(cases)
      .where(eq(cases.status, "active"))
      .groupBy(cases.currency);

    const [activeCompaniesRow] = await db
      .select({
        total: sql<number>`COUNT(DISTINCT ${cases.companyId})`,
      })
      .from(cases)
      .where(eq(cases.status, "active"));

    const [workersLegalRow] = await db
      .select({ total: count() })
      .from(cases)
      .where(and(eq(cases.consentLegal, true), ne(cases.status, "deleted")));

    const [casesResolvedRow] = await db
      .select({ total: count() })
      .from(cases)
      .where(eq(cases.status, "resolved"));

    const companyStats = await db
      .select({
        companyId: cases.companyId,
        companySlug: companies.slug,
        companyName: companies.name,
        caseCount: count(),
        totalUnpaid: sum(cases.amountOwed),
        wageClaims: sql<number>`COALESCE(SUM(CASE WHEN (${cases.claimTypes}->>'unpaidWages')::boolean = true THEN 1 ELSE 0 END), 0)`,
        unfairPracticeClaims: sql<number>`COALESCE(SUM(CASE WHEN (${cases.claimTypes}->>'unfairPractices')::boolean = true THEN 1 ELSE 0 END), 0)`,
        retaliationClaims: sql<number>`COALESCE(SUM(CASE WHEN (${cases.claimTypes}->>'retaliation')::boolean = true THEN 1 ELSE 0 END), 0)`,
        otherClaims: sql<number>`COALESCE(SUM(CASE WHEN (${cases.claimTypes}->>'other')::boolean = true THEN 1 ELSE 0 END), 0)`,
      })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(ne(cases.status, "deleted"))
      .groupBy(cases.companyId, companies.slug, companies.name);

    const data = {
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
        caseCount: c.caseCount,
        totalUnpaid: Number(c.totalUnpaid ?? 0),
        wageClaims: Number(c.wageClaims),
        unfairPracticeClaims: Number(c.unfairPracticeClaims),
        retaliationClaims: Number(c.retaliationClaims),
        otherClaims: Number(c.otherClaims),
      })),
    };

    return success(data);
  } catch (err) {
    console.error("Error fetching stats:", err);
    return error("Failed to fetch stats", 500);
  }
}
