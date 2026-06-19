import { db } from "@/lib/db/client";
import { cases, caseTags } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { success, error, verifyBearerSecret } from "@/lib/utils/api";
import { generateCaseTags } from "@/lib/ai/generate-tags";

export async function POST(request: Request) {
  if (!verifyBearerSecret(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return error("Unauthorized", 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const limit = Math.min(100, Math.max(1, (body as Record<string, unknown>).limit as number || 20));

    const casesWithoutTags = await db
      .select({ id: cases.id })
      .from(cases)
      .leftJoin(caseTags, eq(caseTags.caseId, cases.id))
      .where(and(eq(cases.status, "active"), sql`${caseTags.id} IS NULL`))
      .groupBy(cases.id)
      .limit(limit);

    if (casesWithoutTags.length === 0) {
      return success({ message: "All cases already have tags", processed: 0 });
    }

    const results: { caseId: string; success: boolean; tags: number; error?: string }[] = [];

    for (const caseRow of casesWithoutTags) {
      try {
        const result = await generateCaseTags(caseRow.id);
        results.push({
          caseId: caseRow.id,
          success: result.success,
          tags: result.tagsGenerated,
          error: result.error,
        });
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        results.push({
          caseId: caseRow.id,
          success: false,
          tags: 0,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const totalTags = results.reduce((sum, r) => sum + r.tags, 0);
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return success({
      message: `Processed ${results.length} cases`,
      processed: results.length,
      tagsGenerated: totalTags,
      successCount,
      failCount,
      results,
    });
  } catch (err) {
    console.error("Batch tag generation error:", err);
    return error("Batch generation failed", 500);
  }
}
