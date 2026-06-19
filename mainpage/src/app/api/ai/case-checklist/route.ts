import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";
import { callOpenRouter, getReportModel } from "@/lib/ai/openrouter";
import { CASE_CHECKLIST_SYSTEM, CASE_CHECKLIST_USER } from "@/lib/ai/prompts";

const checklistSchema = z.object({
  displayName: z.string().min(1),
  project: z.string().optional().default(""),
  dateRange: z.string().min(1),
  amountOwed: z.string().min(1),
  contactAttempts: z.number().int().min(0),
  story: z.string().min(1),
});

const checklistItemSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  note: z.string(),
});

const checklistResultSchema = z.object({
  items: z.array(checklistItemSchema),
  summary: z.string(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return error("Authentication required", 401);
  }

  const ip = getClientIp(request);
  const { allowed } = await rateLimit(`ai-checklist:${ip}`);
  if (!allowed) {
    return error("Rate limited. Please wait before trying again.", 429);
  }

  try {
    const body = await request.json();
    const parsed = checklistSchema.safeParse(body);
    if (!parsed.success) {
      return error("Invalid input", 400);
    }

    const raw = await callOpenRouter({
      model: getReportModel(),
      systemPrompt: CASE_CHECKLIST_SYSTEM,
      userPrompt: CASE_CHECKLIST_USER(parsed.data),
      temperature: 0.3,
    });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return error("Failed to parse checklist response", 500);
    }

    let aiParsed: unknown;
    try {
      aiParsed = JSON.parse(jsonMatch[0]);
    } catch {
      return error("Invalid JSON from AI", 500);
    }

    const validated = checklistResultSchema.safeParse(aiParsed);
    if (!validated.success) {
      return error("AI returned unexpected format", 500);
    }

    return success(validated.data);
  } catch (err) {
    console.error("Checklist error:", err);
    return error("Failed to check completeness", 500);
  }
}
