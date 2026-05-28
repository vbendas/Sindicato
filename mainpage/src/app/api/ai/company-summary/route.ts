import { z } from "zod/v4";
import { db } from "@/lib/db/client";
import { cases, companies, companySummaries } from "@/lib/db/schema";
import { eq, and, sum, sql } from "drizzle-orm";
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

    const aiResponse = await callOpenRouter({
      model: getReportModel(),
      systemPrompt: COMPANY_SUMMARY_SYSTEM,
      userPrompt: COMPANY_SUMMARY_USER({
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
      }),
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

    await db
      .insert(companySummaries)
      .values({
        companyId: company.id,
        summary: aiParsed.summary || "",
        commonIssues: aiParsed.commonIssues || [],
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
      resolutionRate: aiParsed.resolutionRate,
      engagementPattern: aiParsed.engagementPattern,
      keyInsight: aiParsed.keyInsight,
    });
  } catch (err) {
    console.error("Company summary error:", err);
    return error("Failed to generate summary", 500);
  }
}
