import { db } from "@/lib/db/client";
import { caseTags, cases } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { auth } from "@/lib/auth";

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return error("Authentication required.", 401);
  }

  try {
    const { id: caseId } = await params;

    const [caseRow] = await db
      .select({ id: cases.id, workerId: cases.workerId })
      .from(cases)
      .where(and(eq(cases.id, caseId), eq(cases.status, "active")))
      .limit(1);

    if (!caseRow) {
      return error("Case not found", 404);
    }

    if (caseRow.workerId !== session.user.id) {
      return error("Not authorised.", 403);
    }

    const body = await request.json();
    const { tagName, category, confidence, sourceText, source } = body;

    if (!tagName || typeof tagName !== "string") {
      return error("tagName is required", 400);
    }

    const [newTag] = await db
      .insert(caseTags)
      .values({
        caseId,
        category: category || "other",
        tagName: tagName.trim(),
        confidence: confidence ?? 100,
        sourceText: sourceText || null,
        source: source || "user",
      })
      .returning();

    return success(newTag, 201);
  } catch (err) {
    console.error("Error creating tag:", err);
    return error("Failed to create tag", 500);
  }
}
