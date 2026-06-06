import { db } from "@/lib/db/client";
import { cases, companies, caseTimelineEvents } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { notifyCompanyNewCase } from "@/lib/email/notifications";
import { redactName } from "@/lib/utils/redaction";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return error("Unauthorized", 401);
  }

  try {
    const pendingCases = await db
      .select({
        caseId: cases.id,
        workerId: cases.workerId,
        companyId: cases.companyId,
        displayName: cases.displayName,
        country: cases.country,
        amountOwed: cases.amountOwed,
        currency: cases.currency,
        companyName: companies.name,
        companyEmail: sql<string>`COALESCE(${companies.contactEmails}->>0, NULL)`,
      })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(
        and(
          eq(cases.optInCompanyNotify, true),
          eq(cases.status, "active"),
          sql`${companies.contactEmails}::jsonb != '[]'::jsonb`,
          sql`EXISTS (
            SELECT 1 FROM ${caseTimelineEvents} e
            WHERE e.case_id = ${cases.id}
            AND e.event_type = 'email_sent'
            AND e.is_automatic = true
            AND e.description LIKE '%notification%'
          ) = false`
        )
      )
      .limit(50);

    let sent = 0;
    let skipped = 0;

    for (const c of pendingCases) {
      if (!c.companyEmail) {
        skipped++;
        continue;
      }

      try {
        await notifyCompanyNewCase({
          companyEmail: c.companyEmail,
          companyName: c.companyName,
          caseSummary: {
            workerName: redactName(c.displayName),
            country: c.country || "",
            amountOwed: c.amountOwed || "0",
            currency: c.currency,
            caseId: c.caseId,
          },
        });

        await db.insert(caseTimelineEvents).values({
          caseId: c.caseId,
          eventType: "email_sent",
          eventDate: new Date(),
          description: `Sindicato sent notification email to ${c.companyName}.`,
          responseReceived: false,
          isAutomatic: true,
        });

        sent++;
      } catch (err) {
        console.error(`Failed to send notification for case ${c.caseId}:`, err);
        skipped++;
      }
    }

    return success({ sent, skipped, total: pendingCases.length });
  } catch (err) {
    console.error("Failed to send pending notifications:", err);
    return error("Internal server error", 500);
  }
}
