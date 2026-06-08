import { db } from "@/lib/db/client";
import { cases, caseAnalyses } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { generateCaseAnalysis } from "@/lib/ai/generate-case-analysis";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return error("Unauthorized", 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const limit = Math.min(100, Math.max(1, (body as Record<string, unknown>).limit as number || 20));

    const casesWithoutAnalysis = await db
      .select({ id: cases.id })
      .from(cases)
      .leftJoin(caseAnalyses, eq(caseAnalyses.caseId, cases.id))
      .where(and(eq(cases.status, "active"), sql`${caseAnalyses.id} IS NULL`))
      .groupBy(cases.id)
      .limit(limit);

    if (casesWithoutAnalysis.length === 0) {
      return success({ message: "All cases already have analyses", processed: 0 });
    }

    const results: { caseId: string; success: boolean; error?: string }[] = [];

    for (const caseRow of casesWithoutAnalysis) {
      try {
        const result = await generateCaseAnalysis(caseRow.id);
        results.push({
          caseId: caseRow.id,
          success: result.success,
          error: result.error,
        });
        await new Promise((r) => setTimeout(r, 1500));
      } catch (err) {
        results.push({
          caseId: caseRow.id,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return success({
      message: `Processed ${results.length} cases`,
      processed: results.length,
      successCount,
      failCount,
      results,
    });
  } catch (err) {
    console.error("Batch case analysis error:", err);
    return error("Batch analysis failed", 500);
  }
}
