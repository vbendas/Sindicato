import { z } from "zod/v4";
import { db } from "@/lib/db/client";
import { cases } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { auth } from "@/lib/auth";
import { generateCaseTags } from "@/lib/ai/generate-tags";

const bodySchema = z.object({
  caseId: z.string().uuid(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return error("Authentication required.", 401);
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return error("Invalid input", 400);
    }

    const { caseId } = parsed.data;

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

    const result = await generateCaseTags(caseId);

    if (!result.success) {
      return error(result.error || "Tag generation failed", 500);
    }

    return success(result);
  } catch (err) {
    console.error("Tag generation error:", err);
    return error("Failed to generate tags", 500);
  }
}
