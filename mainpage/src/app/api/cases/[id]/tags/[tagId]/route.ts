import { z } from "zod/v4";
import { db } from "@/lib/db/client";
import { caseTags, cases } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  workerOverride: z.enum(["confirmed", "rejected"]),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return error("Authentication required.", 401);
  }

  try {
    const { id: caseId, tagId } = await params;

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
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return error("Invalid input", 400);
    }

    const [tag] = await db
      .select()
      .from(caseTags)
      .where(
        and(eq(caseTags.id, tagId), eq(caseTags.caseId, caseId))
      )
      .limit(1);

    if (!tag) {
      return error("Tag not found", 404);
    }

    const [updated] = await db
      .update(caseTags)
      .set({ workerOverride: parsed.data.workerOverride })
      .where(eq(caseTags.id, tagId))
      .returning();

    return success(updated);
  } catch (err) {
    console.error("Error updating tag:", err);
    return error("Failed to update tag", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return error("Authentication required.", 401);
  }

  try {
    const { id: caseId, tagId } = await params;

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

    const [tag] = await db
      .select()
      .from(caseTags)
      .where(
        and(eq(caseTags.id, tagId), eq(caseTags.caseId, caseId))
      )
      .limit(1);

    if (!tag) {
      return error("Tag not found", 404);
    }

    // Only allow deleting user-added tags (not AI-generated)
    if (tag.source !== "user") {
      return error("Cannot delete AI-generated tags. Use reject instead.", 403);
    }

    await db
      .delete(caseTags)
      .where(eq(caseTags.id, tagId));

    return success({ deleted: true });
  } catch (err) {
    console.error("Error deleting tag:", err);
    return error("Failed to delete tag", 500);
  }
}
