import { db } from "@/lib/db/client";
import { cases } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { success, error, getClientIp, verifyBearerSecret } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";

function checkAuth(request: Request) {
  if (!verifyBearerSecret(request.headers.get("Authorization"), process.env.CRON_SECRET)) {
    return error("Unauthorized", 401);
  }
  return null;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = await rateLimit(`admin-batch:${ip}`, 10, 60_000);
  if (!allowed) return error("Too many requests", 429);

  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action, caseIds } = body;

    if (!action || !caseIds || !Array.isArray(caseIds) || caseIds.length === 0) {
      return error("action and caseIds array are required", 400);
    }

    if (caseIds.length > 100) {
      return error("Maximum 100 cases per batch", 400);
    }

    if (action === "resolve") {
      const result = await db
        .update(cases)
        .set({
          status: "resolved",
          resolutionStatus: "resolved",
          resolutionDate: new Date(),
        })
        .where(inArray(cases.id, caseIds))
        .returning({ id: cases.id });

      return success({ updated: result.length, ids: result.map((r) => r.id) });
    }

    if (action === "delete") {
      const result = await db
        .update(cases)
        .set({ status: "deleted" })
        .where(inArray(cases.id, caseIds))
        .returning({ id: cases.id });

      return success({ updated: result.length, ids: result.map((r) => r.id) });
    }

    if (action === "assign") {
      const { assignedTo } = body;
      if (!assignedTo) return error("assignedTo is required for assign action", 400);

      const result = await db
        .update(cases)
        .set({ updatedAt: new Date() })
        .where(inArray(cases.id, caseIds))
        .returning({ id: cases.id });

      return success({ updated: result.length, ids: result.map((r) => r.id), assignedTo });
    }

    return error("Invalid action. Use 'resolve', 'delete', or 'assign'.", 400);
  } catch (err) {
    console.error("Failed to batch process cases:", err);
    return error("Internal server error", 500);
  }
}
