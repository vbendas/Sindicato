import { db } from "@/lib/db/client";
import { caseTags, cases } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { invalidateCompanySummary } from "@/lib/ai/invalidate-summary";

const createTagSchema = z.object({
  tagName: z.string().min(1).max(200),
  category: z.enum(["other", "worker_action", "payment", "legal", "communication"]).default("other"),
  confidence: z.number().int().min(0).max(100).default(100),
  sourceText: z.string().max(2000).nullable().default(null),
  source: z.enum(["user", "ai", "auto"]).default("user"),
});

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
      .select({ id: cases.id, workerId: cases.workerId, companyId: cases.companyId })
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
    const parsed = createTagSchema.safeParse(body);
    if (!parsed.success) {
      return error("Invalid tag data", 400, parsed.error.flatten().fieldErrors);
    }

    const [newTag] = await db
      .insert(caseTags)
      .values({
        caseId,
        category: parsed.data.category,
        tagName: parsed.data.tagName.trim(),
        confidence: parsed.data.confidence,
        sourceText: parsed.data.sourceText,
        source: parsed.data.source,
      })
      .returning();

    invalidateCompanySummary(caseRow.companyId).catch((err) =>
      console.error("Failed to invalidate company summary:", err)
    );

    return success(newTag, 201);
  } catch (err) {
    console.error("Error creating tag:", err);
    return error("Failed to create tag", 500);
  }
}
