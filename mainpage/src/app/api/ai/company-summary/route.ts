import { z } from "zod/v4";
import { db } from "@/lib/db/client";
import { cases, companies, companySummaries, caseTags } from "@/lib/db/schema";
import { eq, and, sum, sql, count } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { callOpenRouter, getReportModel } from "@/lib/ai/openrouter";
import { COMPANY_SUMMARY_SYSTEM, COMPANY_SUMMARY_USER } from "@/lib/ai/prompts";

const querySchema = z.object({
  companySlug: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      companySlug: searchParams.get("company"),
    });
    if (!parsed.success) {
      return error("Missing or invalid companySlug", 400);
    }

    const { companySlug } = parsed.data;

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.slug, companySlug))
      .limit(1);

    if (!company) {
      return error("Company not found", 404);
    }

    // Check cache first
    const [cachedSummary] = await db
      .select()
      .from(companySummaries)
      .where(
        and(
          eq(companySummaries.companyId, company.id),
          sql`${companySummaries.expiresAt} > NOW()`
        )
      )
      .limit(1);

    if (cachedSummary) {
      return success({
        summary: cachedSummary.summary,
        commonIssues: cachedSummary.commonIssues,
        detectedPatterns: cachedSummary.detectedPatterns ?? [],
        resolutionRate: cachedSummary.resolutionRate,
        engagementPattern: cachedSummary.engagementPattern,
        keyInsight: cachedSummary.keyInsight,
      });
    }

    // Fetch cases with expanded data
    let companyCases;
    try {
      companyCases = await db
        .select({
          story: cases.story,
          amountOwed: cases.amountOwed,
          dateRange: cases.dateRange,
          contactAttempts: cases.contactAttempts,
          resolutionStatus: cases.resolutionStatus,
        })
        .from(cases)
        .where(and(eq(cases.companyId, company.id), eq(cases.status, "active")))
        .limit(50);
      
      console.log(`Fetched ${companyCases.length} cases`);
      
      companyCases = companyCases.map((c) => ({
        ...c,
        caseType: "unpaid_wages" as const,
        daysWithoutAnswer: null as number | null,
      }));
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return error("Failed to fetch case data", 500);
    }

    const [totalRow] = await db
      .select({ total: sum(cases.amountOwed) })
      .from(cases)
      .where(and(eq(cases.companyId, company.id), eq(cases.status, "active")));

    const totalOwed = Number(totalRow?.total ?? 0);
    const resolvedCount = companyCases.filter(
      (c) => c.resolutionStatus === "resolved"
    ).length;

    // Fetch tag aggregation for this company
    let tagSummary = "";
    try {
      const companyCaseIds = await db
        .select({ id: cases.id })
        .from(cases)
        .where(and(eq(cases.companyId, company.id), eq(cases.status, "active")))
        .limit(50);

      if (companyCaseIds.length > 0) {
        const tagCounts = await db
          .select({
            tagName: caseTags.tagName,
            category: caseTags.category,
            source: caseTags.source,
            cnt: count(),
          })
          .from(caseTags)
          .where(
            sql`${caseTags.caseId} IN (${sql.join(
              companyCaseIds.map((c) => sql`${c.id}`),
              sql`, `
            )})`
          )
          .groupBy(caseTags.tagName, caseTags.category, caseTags.source)
          .orderBy(sql`count(*) desc`);

        if (tagCounts.length > 0) {
          // Aggregate by tagName (merge sources)
          const tagMap = new Map<string, { category: string; total: number; sources: Record<string, number> }>();
          for (const tc of tagCounts) {
            const existing = tagMap.get(tc.tagName);
            if (existing) {
              existing.total += tc.cnt;
              existing.sources[tc.source] = (existing.sources[tc.source] || 0) + tc.cnt;
            } else {
              tagMap.set(tc.tagName, {
                category: tc.category,
                total: tc.cnt,
                sources: { [tc.source]: tc.cnt },
              });
            }
          }

          // Import tag taxonomy for severity lookup
          const { getTagSeverity } = await import("@/lib/ai/tag-taxonomy");

          tagSummary = "\n\nAI-DETECTED PATTERN TAGS (from automated analysis of individual cases):\n";
          const sorted = [...tagMap.entries()].sort((a, b) => b[1].total - a[1].total);
          for (const [tagName, data] of sorted) {
            const severity = getTagSeverity(tagName);
            const sourceBreakdown = Object.entries(data.sources)
              .map(([s, c]) => `${c} ${s}`)
              .join(", ");
            tagSummary += `- ${tagName} (${data.category}, ${severity}): ${data.total} cases [${sourceBreakdown}]\n`;
          }
        }
      }
    } catch (tagErr) {
      console.error("Failed to fetch tag aggregation:", tagErr);
    }

    const aiResponse = await callOpenRouter({
      model: getReportModel(),
      systemPrompt: COMPANY_SUMMARY_SYSTEM,
      userPrompt:
        COMPANY_SUMMARY_USER({
          companyName: company.name,
          vertical: company.vertical,
          totalCases: companyCases.length,
          totalOwed: `$${totalOwed.toLocaleString()}`,
          resolvedCount,
          cases: companyCases.map((c) => ({
            story: c.story,
            amountOwed: c.amountOwed,
            dateRange: c.dateRange,
            caseType: c.caseType,
            resolutionStatus: c.resolutionStatus,
            contactAttempts: c.contactAttempts,
            daysWithoutAnswer: c.daysWithoutAnswer,
          })),
        }) + tagSummary,
      temperature: 0.3,
      maxTokens: 800,
    });

    // Parse AI response - strip markdown code blocks if present
    let aiParsed;
    try {
      let jsonString = aiResponse.trim();
      
      // Remove markdown code blocks
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.slice(7);
      } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.slice(3);
      }
      if (jsonString.endsWith("```")) {
        jsonString = jsonString.slice(0, -3);
      }
      jsonString = jsonString.trim();
      
      aiParsed = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      return success({ summary: null });
    }

    // Cache the result (24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const detectedPatterns = Array.isArray(aiParsed.detectedPatterns)
      ? aiParsed.detectedPatterns.filter(
          (p: { pattern?: string; severity?: string; cases?: number; insight?: string }) =>
            p.pattern && p.severity && typeof p.cases === "number" && p.insight
        )
      : [];

    await db
      .insert(companySummaries)
      .values({
        companyId: company.id,
        summary: aiParsed.summary || "",
        commonIssues: aiParsed.commonIssues || [],
        detectedPatterns,
        resolutionRate: aiParsed.resolutionRate || "0%",
        engagementPattern: aiParsed.engagementPattern || "no_response",
        keyInsight: aiParsed.keyInsight || null,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: companySummaries.companyId,
        set: {
          summary: aiParsed.summary || "",
          commonIssues: aiParsed.commonIssues || [],
          detectedPatterns,
          resolutionRate: aiParsed.resolutionRate || "0%",
          engagementPattern: aiParsed.engagementPattern || "no_response",
          keyInsight: aiParsed.keyInsight || null,
          expiresAt,
          generatedAt: new Date(),
        },
      });

    return success({
      summary: aiParsed.summary,
      commonIssues: aiParsed.commonIssues,
      detectedPatterns,
      resolutionRate: aiParsed.resolutionRate,
      engagementPattern: aiParsed.engagementPattern,
      keyInsight: aiParsed.keyInsight,
    });
  } catch (err) {
    console.error("Company summary error:", err);
    return error("Failed to generate summary", 500);
  }
}
