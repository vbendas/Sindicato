import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, and, lt, lte, or, isNull, sql } from "drizzle-orm";
import { sendTemplateEmail } from "@/lib/email/send";
import ResolutionFollowUp from "@/lib/email/templates/resolution-follow-up";
import { success, error } from "@/lib/utils/api";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return error("Unauthorized", 401);
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const eligibleCases = await db
      .select({
        caseId: cases.id,
        companyId: cases.companyId,
        companySlug: companies.slug,
        companyName: companies.name,
        companyEmail: sql<string>`COALESCE(${companies.contactEmails}->>0, NULL)`,
        amountOwed: cases.amountOwed,
        currency: cases.currency,
      })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(
        and(
          eq(cases.status, "active"),
          lt(cases.createdAt, thirtyDaysAgo),
          or(
            isNull(cases.lastFollowUpSentAt),
            lte(cases.lastFollowUpSentAt, thirtyDaysAgo)
          )
        )
      );

    const companyMap = new Map<
      string,
      {
        slug: string;
        name: string;
        email: string | null;
        caseIds: string[];
        totalByCurrency: Map<string, number>;
      }
    >();

    for (const c of eligibleCases) {
      const existing = companyMap.get(c.companyId);
      if (existing) {
        existing.caseIds.push(c.caseId);
        const curr = existing.totalByCurrency.get(c.currency) ?? 0;
        existing.totalByCurrency.set(c.currency, curr + parseFloat(c.amountOwed));
      } else {
        const map = new Map<string, number>();
        map.set(c.currency, parseFloat(c.amountOwed));
        companyMap.set(c.companyId, {
          slug: c.companySlug,
          name: c.companyName,
          email: c.companyEmail,
          caseIds: [c.caseId],
          totalByCurrency: map,
        });
      }
    }

    let emailsSent = 0;
    const now = new Date();

    for (const [, company] of companyMap) {
      if (!company.email) continue;

      try {
        await sendTemplateEmail(
          company.email,
          `Outstanding cases reminder — Sindicato`,
          ResolutionFollowUp,
          {
            companyName: company.name,
            caseCount: company.caseIds.length,
            totalUnpaid: Array.from(company.totalByCurrency.entries())
              .map(([curr, total]) => `${curr} ${total.toFixed(2)}`)
              .join(" + "),
            currency: "",
            dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${company.slug}`,
          }
        );

        for (const caseId of company.caseIds) {
          await db
            .update(cases)
            .set({ lastFollowUpSentAt: now })
            .where(eq(cases.id, caseId));
        }

        emailsSent++;
      } catch (err) {
        console.error(
          `Failed to send follow-up to ${company.name}:`,
          err
        );
      }
    }

    return success({
      emailsSent,
      companiesNotified: companyMap.size,
      casesProcessed: eligibleCases.length,
    });
  } catch (err) {
    console.error("Resolution follow-up cron failed:", err);
    return error("Internal server error", 500);
  }
}
