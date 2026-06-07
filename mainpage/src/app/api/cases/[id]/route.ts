import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { redactName } from "@/lib/utils/redaction";
import { auth } from "@/lib/auth";
import { editStorySchema } from "@/lib/utils/schemas";
import { generateCaseTags } from "@/lib/ai/generate-tags";
import { invalidateCompanySummary } from "@/lib/ai/invalidate-summary";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [row] = await db
      .select({
        id: cases.id,
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
        caseType: cases.caseType,
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
      caseType: row.caseType,
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return error("Authentication required.", 401);
    }
    const workerId = session.user.id;

    const { id } = await params;

    const [caseRow] = await db
      .select({ id: cases.id, workerId: cases.workerId, companyId: cases.companyId })
      .from(cases)
      .where(and(eq(cases.id, id), eq(cases.status, "active")))
      .limit(1);

    if (!caseRow) {
      return error("Case not found", 404);
    }

    if (caseRow.workerId !== workerId) {
      return error("Not authorised.", 403);
    }

    const body = await request.json();
    const parsed = editStorySchema.safeParse(body);
    if (!parsed.success) {
      return error("Invalid input", 400, parsed.error.flatten());
    }

    await db
      .update(cases)
      .set({
        story: parsed.data.story,
        storyTranslated: null,
        translationLanguage: null,
        updatedAt: new Date(),
      })
      .where(eq(cases.id, id));

    generateCaseTags(id).catch((err) =>
      console.error("Failed to regenerate case tags:", err)
    );

    invalidateCompanySummary(caseRow.companyId).catch((err) =>
      console.error("Failed to invalidate company summary:", err)
    );

    return success({ story: parsed.data.story });
  } catch (err) {
    console.error("Error updating case story:", err);
    return error("Failed to update case story", 500);
  }
}
