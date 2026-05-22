import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { redactName } from "@/lib/utils/redaction";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [row] = await db
      .select({
        id: cases.id,
        workerId: cases.workerId,
        displayName: cases.displayName,
        country: cases.country,
        ageRange: cases.ageRange,
        sex: cases.sex,
        project: cases.project,
        dateRange: cases.dateRange,
        amountOwed: cases.amountOwed,
        currency: cases.currency,
        contactAttempts: cases.contactAttempts,
        contactAlias: cases.contactAlias,
        story: cases.story,
        storyTranslated: cases.storyTranslated,
        translationLanguage: cases.translationLanguage,
        status: cases.status,
        resolutionStatus: cases.resolutionStatus,
        vertical: cases.vertical,
        createdAt: cases.createdAt,
        companyName: companies.name,
        companySlug: companies.slug,
      })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(and(eq(cases.id, id), eq(cases.status, "active")))
      .limit(1);

    if (!row) {
      return error("Case not found", 404);
    }

    const data = {
      id: row.id,
      workerId: row.workerId,
      displayName: redactName(row.displayName),
      country: row.country,
      ageRange: row.ageRange,
      sex: row.sex,
      project: row.project,
      dateRange: row.dateRange,
      amountOwed: row.amountOwed,
      currency: row.currency,
      contactAttempts: row.contactAttempts,
      contactAlias: row.contactAlias,
      story: row.story,
      storyTranslated: row.storyTranslated,
      translationLanguage: row.translationLanguage,
      vertical: row.vertical,
      resolutionStatus: row.resolutionStatus,
      createdAt: row.createdAt,
      company: {
        name: row.companyName,
        slug: row.companySlug,
      },
    };

    return success(data);
  } catch (err) {
    console.error("Error fetching case:", err);
    return error("Failed to fetch case", 500);
  }
}
