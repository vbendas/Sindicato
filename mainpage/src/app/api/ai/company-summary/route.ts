import { z } from "zod/v4";
import { db } from "@/lib/db/client";
import { cases, companies, companySummaries, caseTags, caseAnalyses } from "@/lib/db/schema";
import { eq, and, sum, sql, count, inArray } from "drizzle-orm";
import { success, error, getClientIp } from "@/lib/utils/api";
import { callOpenRouter, getReportModel } from "@/lib/ai/openrouter";
import { COMPANY_SUMMARY_SYSTEM, COMPANY_SUMMARY_USER } from "@/lib/ai/prompts";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/auth/rate-limit";

const querySchema = z.object({
  companySlug: z.string().min(1),
});

const COMPANY_SYNTHESIS_SYSTEM = `You are a case analyst for Sindicato. You will receive per-case analyses (key issues + one-sentence summaries) and tag data for a company. Synthesize them into a structured JSON report.

Return ONLY valid JSON with this exact structure:
{
  "summary": "2-3 sentence overview of the situation, what happened, how many workers affected, and overall pattern",
  "commonIssues": ["case_type_1", "case_type_2"],
  "detectedPatterns": [
    {
      "pattern": "exact tag name from the tag data",
      "severity": "green|yellow|orange|red",
      "cases": 5,
      "insight": "one sentence explaining what this pattern means for the company"
    }
  ],
  "resolutionRate": "X%",
  "engagementPattern": "one_of: ignoring|slow_response|retaliation|engaged|no_response",
  "keyInsight": "One sentence highlighting the most important behavioral pattern or concern"
}

RULES:
- commonIssues MUST ONLY contain values from: unpaid_wages, late_payment, sudden_deactivation, unfair_review, predatory_practices, harassment, retaliation, contract_violation, data_privacy, other
- For detectedPatterns, use the tag data provided. Create a pattern for each significant tag.
- Limit to top 5 most significant patterns
- Be factual and neutral`;

function extractJsonObject(raw: string): Record<string, unknown> | null {
  let s = raw.trim();

  // Strip markdown code blocks
  if (s.startsWith("```json")) s = s.slice(7);
  else if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  s = s.trim();

  // Try direct parse
  try {
    const parsed = JSON.parse(s);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {}

  // Brace-counting: find outermost balanced {…}
  const start = s.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = start; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return null;

  const candidate = s.slice(start, end + 1);
  try {
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {}

  return null;
}

function buildBasicSummary(data: {
  companyName: string;
  totalCases: number;
  totalOwed: number;
  resolvedCount: number;
  tagCounts: Map<string, { category: string; total: number }>;
}) {
  const resolutionRate = data.totalCases > 0
    ? `${Math.round((data.resolvedCount / data.totalCases) * 100)}%`
    : "0%";

  const topTags = [...data.tagCounts.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([name, d]) => `${name} (${d.total} cases)`)
    .join(", ");

  const summary = `${data.companyName} has ${data.totalCases} active case${data.totalCases !== 1 ? "s" : ""} filed on Sindicato, with $${data.totalOwed.toLocaleString()} in total unpaid wages. ${data.resolvedCount} of ${data.totalCases} cases have been resolved (${resolutionRate}).${topTags ? ` Common patterns include: ${topTags}.` : ""}`;

  return {
    summary,
    commonIssues: [],
    detectedPatterns: [],
    resolutionRate,
    engagementPattern: "no_response" as const,
    keyInsight: null,
  };
}

async function buildTagSummary(caseIds: string[]) {
  const tagMap = new Map<string, { category: string; total: number; sources: Record<string, number> }>();

  if (caseIds.length === 0) return { tagMap, tagSummary: "" };

  try {
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
          caseIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
      .groupBy(caseTags.tagName, caseTags.category, caseTags.source)
      .orderBy(sql`count(*) desc`);

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

    const { getTagSeverity } = await import("@/lib/ai/tag-taxonomy");

    let tagSummary = "\n\nAI-DETECTED PATTERN TAGS (from automated analysis of individual cases):\n";
    const sorted = [...tagMap.entries()].sort((a, b) => b[1].total - a[1].total);
    for (const [tagName, data] of sorted) {
      const severity = getTagSeverity(tagName);
      const sourceBreakdown = Object.entries(data.sources)
        .map(([s, c]) => `${c} ${s}`)
        .join(", ");
      tagSummary += `- ${tagName} (${data.category}, ${severity}): ${data.total} cases [${sourceBreakdown}]\n`;
    }

    return { tagMap, tagSummary };
  } catch (tagErr) {
    console.error("Failed to fetch tag aggregation:", tagErr);
    return { tagMap, tagSummary: "" };
  }
}

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = await rateLimit(`ai-company-summary:${ip}`, 30, 60 * 60 * 1000);
    if (!allowed) {
      return error("Too many requests", 429);
    }

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
      const isBasic = !cachedSummary.keyInsight ||
        (Array.isArray(cachedSummary.commonIssues) && cachedSummary.commonIssues.length === 0);

      if (!isBasic) {
        return success({
          summary: cachedSummary.summary,
          commonIssues: cachedSummary.commonIssues,
          detectedPatterns: cachedSummary.detectedPatterns ?? [],
          resolutionRate: cachedSummary.resolutionRate,
          engagementPattern: cachedSummary.engagementPattern,
          keyInsight: cachedSummary.keyInsight,
        });
      }
    }

    // Generating a new summary is expensive; require authentication.
    const session = await auth();
    if (!session?.user?.id) {
      return error("Authentication required to generate a company summary", 401);
    }

    // Fetch active case IDs
    const activeCaseIds = await db
      .select({ id: cases.id, story: cases.story, amountOwed: cases.amountOwed, dateRange: cases.dateRange, contactAttempts: cases.contactAttempts, resolutionStatus: cases.resolutionStatus })
      .from(cases)
      .where(and(eq(cases.companyId, company.id), eq(cases.status, "active")))
      .limit(20);

    const caseIds = activeCaseIds.map((c) => c.id);

    const [totalRow] = await db
      .select({ total: sum(cases.amountOwed) })
      .from(cases)
      .where(and(eq(cases.companyId, company.id), eq(cases.status, "active")));

    const totalOwed = Number(totalRow?.total ?? 0);
    const resolvedCount = activeCaseIds.filter(
      (c) => c.resolutionStatus === "resolved"
    ).length;

    // Read stored case analyses
    const storedAnalyses = caseIds.length > 0
      ? await db
          .select()
          .from(caseAnalyses)
          .where(inArray(caseAnalyses.caseId, caseIds))
      : [];

    const analysisMap = new Map(storedAnalyses.map((a) => [a.caseId, a]));
    const analyzedCaseIds = storedAnalyses.map((a) => a.caseId);
    const unanalyzedCases = activeCaseIds.filter((c) => !analysisMap.has(c.id));

    console.log(`[company-summary] ${analyzedCaseIds.length}/${caseIds.length} cases have stored analyses`);

    // Build tag summary from all case IDs
    const { tagMap, tagSummary } = await buildTagSummary(caseIds);

    let aiParsed: Record<string, unknown> | null = null;

    // If all cases have stored analyses, use short synthesis prompt
    if (unanalyzedCases.length === 0 && storedAnalyses.length > 0) {
      console.log("[company-summary] All cases have analyses — using synthesis prompt");

      const analysisTexts = storedAnalyses.map((a, i) =>
        `Case ${i + 1}:\nKey issues: ${JSON.stringify(a.keyIssues)}\nSummary: ${a.caseSummary}`
      ).join("\n\n");

      const synthesisPrompt = `Company: ${company.name} (${company.vertical})\nTotal cases: ${caseIds.length}\nTotal unpaid: $${totalOwed.toLocaleString()}\nResolved: ${resolvedCount} of ${caseIds.length}\n\n--- PER-CASE ANALYSES ---\n${analysisTexts}${tagSummary}`;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const aiResponse = await callOpenRouter({
            model: getReportModel(),
            systemPrompt: COMPANY_SYNTHESIS_SYSTEM,
            userPrompt: synthesisPrompt,
            temperature: 0.3,
            maxTokens: 800,
            timeoutMs: attempt === 0 ? 30_000 : 20_000,
          });

          aiParsed = extractJsonObject(aiResponse);
          if (aiParsed) break;
        } catch (err: unknown) {
          console.error(`[company-summary] Synthesis LLM call failed attempt ${attempt + 1}:`, err instanceof Error ? err.message : err);
        }
      }
    }

    // Fallback: full LLM call with stories (for companies with no stored analyses)
    if (!aiParsed) {
      console.log("[company-summary] Using full LLM call with case stories");

      const companyCases = activeCaseIds.slice(0, 8).map((c) => ({
        story: c.story,
        amountOwed: c.amountOwed,
        dateRange: c.dateRange,
        caseType: "unpaid_wages" as const,
        resolutionStatus: c.resolutionStatus,
        contactAttempts: c.contactAttempts,
        daysWithoutAnswer: null as number | null,
      }));

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const timeout = attempt === 0 ? 45_000 : 30_000;

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
                cases: companyCases,
              }) + tagSummary,
            temperature: 0.3,
            maxTokens: 800,
            timeoutMs: timeout,
          });

          aiParsed = extractJsonObject(aiResponse);
          if (aiParsed) break;
        } catch (err: unknown) {
          console.error(`[company-summary] Full LLM call failed attempt ${attempt + 1}:`, err instanceof Error ? err.message : err);
        }
      }
    }

    // If all LLM calls failed, return basic summary
    if (!aiParsed) {
      console.log("[company-summary] All LLM calls failed, falling back to basic summary");
      const basic = buildBasicSummary({
        companyName: company.name,
        totalCases: caseIds.length,
        totalOwed,
        resolvedCount,
        tagCounts: tagMap,
      });

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await db
        .insert(companySummaries)
        .values({ companyId: company.id, ...basic, expiresAt })
        .onConflictDoUpdate({
          target: companySummaries.companyId,
          set: { ...basic, expiresAt, generatedAt: new Date() },
        });

      return success(basic);
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

    const summaryData = {
      summary: (aiParsed.summary as string) || "",
      commonIssues: (aiParsed.commonIssues as string[]) || [],
      detectedPatterns,
      resolutionRate: (aiParsed.resolutionRate as string) || "0%",
      engagementPattern: (aiParsed.engagementPattern as string) || "no_response",
      keyInsight: (aiParsed.keyInsight as string) || null,
    };

    await db
      .insert(companySummaries)
      .values({
        companyId: company.id,
        ...summaryData,
        includedCaseIds: analyzedCaseIds,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: companySummaries.companyId,
        set: {
          ...summaryData,
          includedCaseIds: analyzedCaseIds,
          expiresAt,
          generatedAt: new Date(),
        },
      });

    return success(summaryData);
  } catch (err: unknown) {
    console.error("Company summary error:", err);
    const message = err instanceof Error ? err.message : String(err);
    if (err instanceof Error && err.name === "AbortError") {
      return error("Summary generation timed out — try again later", 504);
    }
    return error(`Failed to generate summary: ${message}`, 500);
  }
}
