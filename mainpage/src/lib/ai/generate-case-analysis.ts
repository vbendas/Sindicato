import { db } from "@/lib/db/client";
import { cases, companies, caseAnalyses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { callOpenRouter, getReportModel } from "@/lib/ai/openrouter";

const CASE_ANALYSIS_SYSTEM = `You are a case analyst for Sindicato. Analyze a worker's case and extract key issues and a brief summary.

Return ONLY valid JSON with this exact structure:
{
  "keyIssues": ["issue_1", "issue_2"],
  "caseSummary": "One sentence summarizing the case: what happened, how much is owed, and what the company did."
}

RULES:
- keyIssues must be short lowercase strings (2-5 words), e.g. "sudden termination", "unpaid wages", "ignored messages", "quality claims after dispute"
- Max 5 keyIssues, ordered by severity (most severe first)
- caseSummary must be exactly one sentence, factual, no speculation
- Do NOT include legal conclusions or moral judgments
- Return ONLY the JSON, no markdown`;

function extractJsonObject(raw: string): Record<string, unknown> | null {
  let s = raw.trim();
  if (s.startsWith("```json")) s = s.slice(7);
  else if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  s = s.trim();

  try {
    const parsed = JSON.parse(s);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {}

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

  try {
    const parsed = JSON.parse(s.slice(start, end + 1));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {}

  return null;
}

export interface GenerateCaseAnalysisResult {
  success: boolean;
  error?: string;
  rawResponse?: string;
}

export async function generateCaseAnalysis(
  caseId: string
): Promise<GenerateCaseAnalysisResult> {
  const [caseRow] = await db
    .select({
      story: cases.story,
      companyId: cases.companyId,
    })
    .from(cases)
    .where(and(eq(cases.id, caseId), eq(cases.status, "active")))
    .limit(1);

  if (!caseRow) {
    return { success: false, error: "Case not found" };
  }

  const [company] = await db
    .select({ name: companies.name })
    .from(companies)
    .where(eq(companies.id, caseRow.companyId))
    .limit(1);

  if (!company) {
    return { success: false, error: "Company not found" };
  }

  let raw: string;
  try {
    raw = await callOpenRouter({
      model: getReportModel(),
      systemPrompt: CASE_ANALYSIS_SYSTEM,
      userPrompt: `Analyze this case against ${company.name}:\n\nStory: ${caseRow.story.slice(0, 3000)}`,
      temperature: 0.2,
      maxTokens: 800,
      timeoutMs: 60_000,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[case-analysis] OpenRouter API call failed for case ${caseId}:`, msg);
    return { success: false, error: `AI API call failed: ${msg}` };
  }

  const parsed = extractJsonObject(raw);

  if (!parsed || !Array.isArray(parsed.keyIssues) || typeof parsed.caseSummary !== "string") {
    console.error(`[case-analysis] Failed to parse AI response for case ${caseId}:`, JSON.stringify(raw).slice(0, 500));
    return { success: false, error: "AI returned invalid JSON", rawResponse: raw.slice(0, 300) };
  }

  const keyIssues = (parsed.keyIssues as string[])
    .filter((s) => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim().toLowerCase())
    .slice(0, 5);

  const caseSummary = (parsed.caseSummary as string).trim();

  // Upsert analysis (replace existing)
  await db
    .insert(caseAnalyses)
    .values({
      caseId,
      companyId: caseRow.companyId,
      keyIssues,
      caseSummary,
    })
    .onConflictDoUpdate({
      target: caseAnalyses.caseId,
      set: {
        keyIssues,
        caseSummary,
        generatedAt: new Date(),
      },
    });

  console.log(`[case-analysis] Generated analysis for case ${caseId}: ${keyIssues.length} issues`);

  return { success: true };
}
