import { db } from "@/lib/db/client";
import { caseTimelineEvents, cases } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { auth } from "@/lib/auth";
import { timelineEventInputSchema } from "@/lib/utils/schemas";
import { generateCaseTags } from "@/lib/ai/generate-tags";

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

    const events = await db
      .select()
      .from(caseTimelineEvents)
      .where(eq(caseTimelineEvents.caseId, id))
      .orderBy(asc(caseTimelineEvents.eventDate));

    return success(events);
  } catch (err) {
    console.error("Error fetching timeline events:", err);
    return error("Failed to fetch timeline events", 500);
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
  const workerId = session.user.id;

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

    if (caseRow.workerId !== workerId) {
      return error("Not authorised.", 403);
    }

    const body = await request.json();
    const parsed = timelineEventInputSchema.safeParse(body);

    if (!parsed.success) {
      return error("Invalid input", 400, parsed.error.flatten());
    }

    const data = parsed.data;

    const [event] = await db
      .insert(caseTimelineEvents)
      .values({
        caseId,
        workerId,
        eventType: data.eventType,
        eventDate: new Date(data.eventDate),
        description: data.description,
        responseReceived: data.responseReceived,
      })
      .returning();

    // Re-generate AI tags (fire-and-forget)
    generateCaseTags(caseId).catch((err) =>
      console.error("Failed to regenerate case tags:", err)
    );

    return success(event, 201);
  } catch (err) {
    console.error("Error creating timeline event:", err);
    return error("Failed to create timeline event", 500);
  }
}
