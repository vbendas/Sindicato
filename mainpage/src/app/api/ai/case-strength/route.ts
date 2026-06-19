import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";
import { callOpenRouter, getReportModel } from "@/lib/ai/openrouter";
import { CASE_STRENGTH_SYSTEM, CASE_STRENGTH_USER } from "@/lib/ai/prompts";

const caseStrengthSchema = z.object({
  displayName: z.string().min(1),
  country: z.string().optional().default(""),
  project: z.string().optional().default(""),
  dateRange: z.string().min(1),
  amountOwed: z.string().min(1),
  currency: z.string().min(1),
  contactAttempts: z.number().int().min(0),
  story: z.string().min(1),
});

const strengthElementSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  note: z.string(),
});

const strengthResultSchema = z.object({
  elements: z.array(strengthElementSchema),
  score: z.number().int().min(0).max(8),
  maxScore: z.literal(8),
  summary: z.string(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return error("Authentication required", 401);
  }

  const ip = getClientIp(request);
  const { allowed } = await rateLimit(`ai-strength:${ip}`);
  if (!allowed) {
    return error("Rate limited. Please wait before trying again.", 429);
  }

  try {
    const body = await request.json();
    const parsed = caseStrengthSchema.safeParse(body);
    if (!parsed.success) {
      return error("Invalid input", 400);
    }

    const raw = await callOpenRouter({
      model: getReportModel(),
      systemPrompt: CASE_STRENGTH_SYSTEM,
      userPrompt: CASE_STRENGTH_USER(parsed.data),
      temperature: 0.3,
    });

    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return error("Failed to parse strength evaluation", 500);
    }

    let aiParsed: unknown;
    try {
      aiParsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    } catch {
      return error("Invalid JSON from AI evaluation", 500);
    }

    const validated = strengthResultSchema.safeParse(aiParsed);
    if (!validated.success) {
      return error("AI returned unexpected evaluation format", 500);
    }

    return success(validated.data);
  } catch (err) {
    console.error("Case strength error:", err);
    return error("Failed to evaluate case strength", 500);
  }
}
