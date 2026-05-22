import { db } from "@/lib/db/client";
import { caseTimelineEvents, cases } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateEventSchema = z.object({
  eventType: z.enum(["email_sent", "no_response", "canned_response", "chat_support", "phone_call", "legal_notice", "payment_partial", "case_updated", "resolved", "other"]).optional(),
  eventDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)).optional(),
  title: z.string().max(255).nullable().optional(),
  description: z.string().min(1).max(10000).optional(),
  direction: z.enum(["worker_to_company", "company_to_worker", "system"]).optional(),
  labels: z.array(z.string().max(100)).optional(),
});

async function checkOwnership(caseId: string): Promise<{ userId: string; error: Response | null }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { userId: "", error: error("Authentication required.", 401) };

  const [caseRow] = await db
    .select({ workerId: cases.workerId })
    .from(cases)
    .where(and(eq(cases.id, caseId), eq(cases.status, "active")))
    .limit(1);

  if (!caseRow) return { userId: "", error: error("Case not found", 404) };
  if (!caseRow.workerId || caseRow.workerId !== userId) return { userId: "", error: error("Not authorised.", 403) };

  return { userId, error: null };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id, eventId } = await params;

    const { error: authErr } = await checkOwnership(id);
    if (authErr) return authErr;

    const [existing] = await db
      .select()
      .from(caseTimelineEvents)
      .where(and(eq(caseTimelineEvents.id, eventId), eq(caseTimelineEvents.caseId, id)))
      .limit(1);

    if (!existing) return error("Timeline event not found", 404);

    if (existing.isAutomatic) return error("Cannot edit automatic events", 403);

    const body = await request.json();
    const parsed = updateEventSchema.safeParse(body);
    if (!parsed.success) return error("Invalid input", 400, parsed.error.flatten());

    const updateData: Record<string, unknown> = {};
    if (parsed.data.eventType !== undefined) updateData.eventType = parsed.data.eventType;
    if (parsed.data.eventDate !== undefined) updateData.eventDate = new Date(parsed.data.eventDate);
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.direction !== undefined) updateData.direction = parsed.data.direction;
    if (parsed.data.labels !== undefined) updateData.labels = parsed.data.labels;

    if (parsed.data.direction === "company_to_worker") {
      updateData.responseReceived = true;
    } else if (parsed.data.direction === "worker_to_company") {
      updateData.responseReceived = false;
    }

    const [updated] = await db
      .update(caseTimelineEvents)
      .set(updateData)
      .where(eq(caseTimelineEvents.id, eventId))
      .returning();

    return success(updated);
  } catch (err) {
    console.error("Error updating timeline event:", err);
    return error("Failed to update timeline event", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id, eventId } = await params;

    const { error: authErr } = await checkOwnership(id);
    if (authErr) return authErr;

    const [existing] = await db
      .select()
      .from(caseTimelineEvents)
      .where(and(eq(caseTimelineEvents.id, eventId), eq(caseTimelineEvents.caseId, id)))
      .limit(1);

    if (!existing) return error("Timeline event not found", 404);

    if (existing.isAutomatic) return error("Cannot delete automatic events", 403);

    await db.delete(caseTimelineEvents).where(eq(caseTimelineEvents.id, eventId));

    return success({ deleted: true });
  } catch (err) {
    console.error("Error deleting timeline event:", err);
    return error("Failed to delete timeline event", 500);
  }
}
