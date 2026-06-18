import { db } from "@/lib/db/client";
import { caseTimelineEvents, cases, caseTags } from "@/lib/db/schema";
import { eq, and, asc, isNotNull, count } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { auth } from "@/lib/auth";
import { timelineEventInputSchema } from "@/lib/utils/schemas";
import { generateCaseTags } from "@/lib/ai/generate-tags";
import { generateCaseAnalysis } from "@/lib/ai/generate-case-analysis";
import { invalidateCompanySummary } from "@/lib/ai/invalidate-summary";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const isPrivileged = !!(session?.user?.role && session?.user?.approvalStatus === "approved");

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

    const sanitized = events.map((e) => ({
      id: e.id,
      caseId: e.caseId,
      eventType: e.eventType,
      eventDate: e.eventDate,
      title: e.title,
      description: e.description,
      direction: e.direction,
      labels: e.labels,
      isAutomatic: e.isAutomatic,
      responseReceived: e.responseReceived,
      createdAt: e.createdAt,
      ...(isPrivileged ? { workerId: e.workerId, emailContent: e.emailContent } : {}),
    }));

    return success(sanitized);
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
      .select({ id: cases.id, workerId: cases.workerId, companyId: cases.companyId })
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

    // Auto-tag "Public documentation" on first user-created timeline event
    const [userEventCount] = await db
      .select({ count: count() })
      .from(caseTimelineEvents)
      .where(
        and(
          eq(caseTimelineEvents.caseId, caseId),
          isNotNull(caseTimelineEvents.workerId),
          eq(caseTimelineEvents.isAutomatic, false)
        )
      );

    if (userEventCount.count === 1) {
      await db.insert(caseTags).values({
        caseId,
        category: "worker_action",
        tagName: "Public documentation",
        confidence: 100,
        sourceText: "Worker added their first timeline event",
        source: "auto",
      }).catch((err) =>
        console.error("Failed to auto-tag Public documentation:", err)
      );
    }

    // Re-generate AI tags (fire-and-forget)
    generateCaseTags(caseId).catch((err) =>
      console.error("Failed to regenerate case tags:", err)
    );

    generateCaseAnalysis(caseId).catch((err) =>
      console.error("Failed to regenerate case analysis:", err)
    );

    invalidateCompanySummary(caseRow.companyId).catch((err) =>
      console.error("Failed to invalidate company summary:", err)
    );

    return success(event, 201);
  } catch (err) {
    console.error("Error creating timeline event:", err);
    return error("Failed to create timeline event", 500);
  }
}
