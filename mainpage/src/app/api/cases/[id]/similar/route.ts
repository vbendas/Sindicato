import { db } from "@/lib/db/client";
import { cases, companies, caseTags } from "@/lib/db/schema";
import { eq, and, inArray, ne, sql } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { redactName } from "@/lib/utils/redaction";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [currentCase] = await db
      .select()
      .from(cases)
      .where(eq(cases.id, id))
      .limit(1);

    if (!currentCase) return error("Case not found", 404);

    const caseTagsList = await db
      .select({ tagName: caseTags.tagName })
      .from(caseTags)
      .where(eq(caseTags.caseId, id));

    if (caseTagsList.length === 0) return success({ similar: [] });

    const tagNames = caseTagsList.map((t) => t.tagName);

    const similarTagCases = await db
      .select({
        caseId: caseTags.caseId,
        matchCount: sql<number>`COUNT(*)`,
      })
      .from(caseTags)
      .where(
        and(inArray(caseTags.tagName, tagNames), ne(caseTags.caseId, id))
      )
      .groupBy(caseTags.caseId)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(5);

    if (similarTagCases.length === 0) return success({ similar: [] });

    const similarIds = similarTagCases.map((c) => c.caseId);

    const similarCases = await db
      .select({
        id: cases.id,
        displayName: cases.displayName,
        country: cases.country,
        caseType: cases.caseType,
        companyName: companies.name,
        createdAt: cases.createdAt,
      })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(inArray(cases.id, similarIds));

    return success({
      similar: similarCases.map((c) => ({
        ...c,
        displayName: redactName(c.displayName),
        matchCount:
          similarTagCases.find((t) => t.caseId === c.id)?.matchCount || 0,
      })),
    });
  } catch (err) {
    console.error("Similar cases error:", err);
    return error("Failed to find similar cases", 500);
  }
}
