import { db } from "@/lib/db/client";
import { cases, companies, caseTimelineEvents, caseTags } from "@/lib/db/schema";
import { eq, and, or, isNull, sql } from "drizzle-orm";
import { render } from "@react-email/components";
import { sendTemplateEmail } from "@/lib/email/send";
import PerCaseFollowUp from "@/lib/email/templates/per-case-follow-up";
import { success, error } from "@/lib/utils/api";
import { redactName, formatCaseType } from "@/lib/utils/redaction";
import { getTagSeverity, type TagSeverity } from "@/lib/ai/tag-taxonomy";

const BATCH_SIZE = 50;
const MAX_DAYS_BETWEEN_EMAILS = 7;

const WAGE_THEFT_TYPES = ["unpaid_wages", "late_payment", "contract_violation"];

async function renderPerCaseEmail(props: {
  companyName: string;
  caseType: string;
  displayName: string;
  amountOwed: string;
  currency: string;
  storyPreview: string;
  daysSinceFiled: number;
  caseUrl: string;
  showAmount: boolean;
  tags: Array<{ tagName: string; severity: TagSeverity }>;
}) {
  return render(<PerCaseFollowUp {...props} />);
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return error("Unauthorized", 401);
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - MAX_DAYS_BETWEEN_EMAILS);

  try {
    const eligibleCases = await db
      .select({
        caseId: cases.id,
        caseType: cases.caseType,
        displayName: cases.displayName,
        amountOwed: cases.amountOwed,
        currency: cases.currency,
        story: cases.story,
        createdAt: cases.createdAt,
        companyId: cases.companyId,
        companySlug: companies.slug,
        companyName: companies.name,
        companyEmail: sql<string>`COALESCE(${companies.contactEmails}->>0, NULL)`,
        lastPerCaseEmailSentAt: cases.lastPerCaseEmailSentAt,
      })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(
        and(
          eq(cases.status, "active"),
          eq(cases.optInCompanyNotify, true),
          or(
            isNull(cases.lastPerCaseEmailSentAt),
            sql`${cases.lastPerCaseEmailSentAt} <= ${sevenDaysAgo}`
          )
        )
      )
      .limit(BATCH_SIZE);

    const caseIds = eligibleCases.map((c) => c.caseId);

    const tagsByCase = new Map<
      string,
      Array<{ tagName: string; severity: TagSeverity }>
    >();

    if (caseIds.length > 0) {
      const allTags = await db
        .select({
          caseId: caseTags.caseId,
          tagName: caseTags.tagName,
        })
        .from(caseTags)
        .where(
          sql`${caseTags.caseId} IN (${sql.join(
            caseIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        );

      for (const tag of allTags) {
        const severity = getTagSeverity(tag.tagName);
        const existing = tagsByCase.get(tag.caseId) || [];
        existing.push({ tagName: tag.tagName, severity });
        tagsByCase.set(tag.caseId, existing);
      }
    }

    let emailsSent = 0;
    const now = new Date();

    for (const c of eligibleCases) {
      if (!c.companyEmail) continue;

      const daysSinceFiled = Math.floor(
        (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      const storyPreview =
        c.story.length > 300 ? `${c.story.slice(0, 300)}...` : c.story;

      const caseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/en/cases/${c.caseId}`;

      const emailProps = {
        companyName: c.companyName,
        caseType: formatCaseType(c.caseType),
        displayName: redactName(c.displayName),
        amountOwed: c.amountOwed,
        currency: c.currency,
        storyPreview,
        daysSinceFiled,
        caseUrl,
        showAmount: WAGE_THEFT_TYPES.includes(c.caseType),
        tags: tagsByCase.get(c.caseId) || [],
      };

      let html: string;
      try {
        html = await renderPerCaseEmail(emailProps);
      } catch (renderErr) {
        console.error(`Failed to render email for case ${c.caseId}:`, renderErr);
        continue;
      }

      try {
        await sendTemplateEmail(
          c.companyEmail,
          `Open case follow-up — ${c.companyName} — Sindicato`,
          PerCaseFollowUp,
          emailProps
        );

        await db.insert(caseTimelineEvents).values({
          caseId: c.caseId,
          eventType: "email_sent",
          eventDate: now,
          description: `Automated weekly follow-up email sent to ${c.companyName} regarding unresolved case.`,
          direction: "system",
          emailContent: html,
          isAutomatic: true,
          labels: ["automated", "weekly_follow_up"],
        });

        await db
          .update(cases)
          .set({ lastPerCaseEmailSentAt: now })
          .where(eq(cases.id, c.caseId));

        emailsSent++;
      } catch (err) {
        console.error(
          `Failed to send per-case email for ${c.caseId} to ${c.companyName}:`,
          err
        );
      }
    }

    return success({
      emailsSent,
      casesProcessed: eligibleCases.length,
    });
  } catch (err) {
    console.error("Weekly per-case email cron failed:", err);
    return error("Internal server error", 500);
  }
}
