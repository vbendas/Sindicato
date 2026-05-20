import { z } from "zod/v4";
import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, and, sum } from "drizzle-orm";
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

    if (company.summary) {
      return success({ summary: company.summary });
    }

    const companyCases = await db
      .select({
        story: cases.story,
        amountOwed: cases.amountOwed,
        dateRange: cases.dateRange,
        claimTypes: cases.claimTypes,
      })
      .from(cases)
      .where(and(eq(cases.companyId, company.id), eq(cases.status, "active")));

    const [totalRow] = await db
      .select({ total: sum(cases.amountOwed) })
      .from(cases)
      .where(and(eq(cases.companyId, company.id), eq(cases.status, "active")));

    const totalOwed = Number(totalRow?.total ?? 0);

    const summary = await callOpenRouter({
      model: getReportModel(),
      systemPrompt: COMPANY_SUMMARY_SYSTEM,
      userPrompt: COMPANY_SUMMARY_USER({
        companyName: company.name,
        vertical: company.vertical,
        totalCases: companyCases.length,
        totalOwed: `$${totalOwed.toLocaleString()}`,
        cases: companyCases.map((c) => ({
          story: c.story,
          amountOwed: c.amountOwed,
          dateRange: c.dateRange,
          claimTypes: JSON.stringify(c.claimTypes),
        })),
      }),
      temperature: 0.3,
      maxTokens: 500,
    });

    return success({ summary });
  } catch (err) {
    console.error("Company summary error:", err);
    return error("Failed to generate summary", 500);
  }
}
