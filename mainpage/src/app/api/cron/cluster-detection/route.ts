import { db } from "@/lib/db/client";
import { cases, companies, caseTags } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { success, error, verifyBearerSecret } from "@/lib/utils/api";

export async function GET(request: Request) {
  if (!verifyBearerSecret(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return error("Unauthorized", 401);
  }

  try {
    const companiesWithActiveCases = await db
      .select({
        companyId: companies.id,
        companyName: companies.name,
        companySlug: companies.slug,
        caseType: cases.caseType,
        caseCount: sql<number>`COUNT(*)`,
      })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(eq(cases.status, "active"))
      .groupBy(companies.id, companies.name, companies.slug, cases.caseType)
      .having(sql`COUNT(*) >= 3`);

    const clusters: Array<{
      companyId: string;
      companyName: string;
      companySlug: string;
      caseType: string;
      caseCount: number;
      sharedTags: string[];
    }> = [];

    for (const row of companiesWithActiveCases) {
      const sharedTagsResult = await db
        .select({ tagName: caseTags.tagName })
        .from(caseTags)
        .innerJoin(cases, eq(caseTags.caseId, cases.id))
        .where(and(eq(cases.companyId, row.companyId), eq(cases.status, "active")))
        .groupBy(caseTags.tagName)
        .having(sql`COUNT(DISTINCT ${caseTags.caseId}) >= 3`)
        .orderBy(sql`COUNT(DISTINCT ${caseTags.caseId}) DESC`);

      clusters.push({
        companyId: row.companyId,
        companyName: row.companyName,
        companySlug: row.companySlug,
        caseType: row.caseType,
        caseCount: Number(row.caseCount),
        sharedTags: sharedTagsResult.map((t) => t.tagName),
      });
    }

    return success({ clusters, totalClusters: clusters.length });
  } catch (err) {
    console.error("Cluster detection cron failed:", err);
    return error("Internal server error", 500);
  }
}
