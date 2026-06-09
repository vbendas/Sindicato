import { db } from "@/lib/db/client";
import { cases, companies, companySummaries, caseTags } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { sendTemplateEmail } from "@/lib/email/send";
import WeeklyCompanyReport from "@/lib/email/templates/weekly-company-report";
import { getTagSeverity } from "@/lib/ai/tag-taxonomy";
import { success, error } from "@/lib/utils/api";
import type { TagSeverity } from "@/lib/ai/tag-taxonomy";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return error("Unauthorized", 401);
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const companiesWithCases = await db
      .selectDistinct({
        companyId: companies.id,
        companySlug: companies.slug,
        companyName: companies.name,
        companyEmail: sql<string>`COALESCE(${companies.contactEmails}->>0, NULL)`,
      })
      .from(companies)
      .innerJoin(cases, eq(cases.companyId, companies.id))
      .where(eq(cases.status, "active"));

    let emailsSent = 0;

    for (const company of companiesWithCases) {
      if (!company.companyEmail) continue;

      const stats = await db
        .select({
          totalCases: sql<number>`COUNT(*)`,
          newThisWeek: sql<number>`SUM(CASE WHEN ${cases.createdAt} >= ${sevenDaysAgo} THEN 1 ELSE 0 END)`,
          unresolvedCount: sql<number>`SUM(CASE WHEN ${cases.status} = 'active' THEN 1 ELSE 0 END)`,
          resolvedCount: sql<number>`SUM(CASE WHEN ${cases.status} = 'resolved' THEN 1 ELSE 0 END)`,
          totalUnpaid: sql<string>`COALESCE(SUM(CASE WHEN ${cases.status} = 'active' THEN ${cases.amountOwed}::numeric ELSE 0 END), 0)`,
        })
        .from(cases)
        .where(eq(cases.companyId, company.companyId));

      const row = stats[0];
      if (!row) continue;

      const [oldestCase] = await db
        .select({
          ageDays: sql<number>`EXTRACT(EPOCH FROM (NOW() - ${cases.createdAt})) / 86400`,
        })
        .from(cases)
        .where(
          eq(cases.companyId, company.companyId) &&
          eq(cases.status, "active")
        )
        .orderBy(desc(cases.createdAt))
        .limit(1);

      const oldestCaseDays = oldestCase
        ? Math.floor(oldestCase.ageDays)
        : 0;

      const [summary] = await db
        .select()
        .from(companySummaries)
        .where(eq(companySummaries.companyId, company.companyId))
        .limit(1);

      const companyTags: Array<{
        tagName: string;
        severity: TagSeverity;
        count: number;
      }> = [];

      if (summary) {
        const tagCounts = new Map<string, { category: string; count: number }>();

        if (summary.commonIssues) {
          for (const issue of summary.commonIssues) {
            const existing = tagCounts.get(issue);
            if (existing) {
              existing.count++;
            } else {
              tagCounts.set(issue, { category: "", count: 1 });
            }
          }
        }

        if (summary.detectedPatterns) {
          for (const pattern of summary.detectedPatterns) {
            const existing = tagCounts.get(pattern.pattern);
            if (existing) {
              existing.count += pattern.cases;
            } else {
              tagCounts.set(pattern.pattern, {
                category: "",
                count: pattern.cases,
              });
            }
          }
        }

        const aggregated = await db
          .select({
            tagName: caseTags.tagName,
            cnt: sql<number>`COUNT(*)`,
          })
          .from(caseTags)
          .innerJoin(cases, eq(caseTags.caseId, cases.id))
          .where(eq(cases.companyId, company.companyId))
          .groupBy(caseTags.tagName)
          .orderBy(sql`COUNT(*) DESC`)
          .limit(10);

        for (const at of aggregated) {
          if (!tagCounts.has(at.tagName)) {
            tagCounts.set(at.tagName, { category: "", count: at.cnt });
          }
        }

        for (const [tagName, data] of tagCounts) {
          const severity = getTagSeverity(tagName);
          companyTags.push({ tagName, severity, count: data.count });
        }
      }

      const reportUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${company.companySlug}`;

      try {
        await sendTemplateEmail(
          company.companyEmail,
          `Weekly case report — ${company.companyName} — Sindicato`,
          WeeklyCompanyReport,
          {
            companyName: company.companyName,
            totalCases: Number(row.totalCases),
            newThisWeek: Number(row.newThisWeek),
            totalUnpaid: Number(row.totalUnpaid).toFixed(2),
            currency: "EUR",
            unresolvedCount: Number(row.unresolvedCount),
            resolvedCount: Number(row.resolvedCount),
            oldestCaseDays,
            keyInsight: summary?.keyInsight ?? null,
            engagementPattern: summary?.engagementPattern ?? null,
            companyTags,
            reportUrl,
          }
        );

        emailsSent++;
      } catch (err) {
        console.error(
          `Failed to send weekly stats to ${company.companyName}:`,
          err
        );
      }
    }

    return success({
      emailsSent,
      companiesNotified: companiesWithCases.length,
    });
  } catch (err) {
    console.error("Weekly company stats cron failed:", err);
    return error("Internal server error", 500);
  }
}
