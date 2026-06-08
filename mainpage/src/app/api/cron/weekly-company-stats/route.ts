import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendTemplateEmail } from "@/lib/email/send";
import WeeklyCompanyReport from "@/lib/email/templates/weekly-company-report";
import { success, error } from "@/lib/utils/api";

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
          totalUnpaid: sql<string>`COALESCE(SUM(CASE WHEN ${cases.status} = 'active' THEN ${cases.amountOwed}::numeric ELSE 0 END), 0)`,
        })
        .from(cases)
        .where(eq(cases.companyId, company.companyId));

      const row = stats[0];
      if (!row) continue;

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
