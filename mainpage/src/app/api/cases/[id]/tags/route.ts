import { db } from "@/lib/db/client";
import { caseTags, cases } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [caseRow] = await db
      .select({ id: cases.id })
      .from(cases)
      .where(and(eq(cases.id, id), eq(cases.status, "active")))
      .limit(1);

    if (!caseRow) {
      return error("Case not found", 404);
    }

    const tags = await db
      .select()
      .from(caseTags)
      .where(eq(caseTags.caseId, id))
      .orderBy(caseTags.category, caseTags.confidence);

    return success(tags);
  } catch (err) {
    console.error("Error fetching case tags:", err);
    return error("Failed to fetch tags", 500);
  }
}
