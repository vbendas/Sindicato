import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";
import { callOpenRouter, getWritingModel } from "@/lib/ai/openrouter";
import { WRITING_ASSISTANT_SYSTEM, WRITING_ASSISTANT_USER } from "@/lib/ai/prompts";

const writingAssistantSchema = z.object({
  displayName: z.string().min(1),
  country: z.string().optional().default(""),
  project: z.string().optional().default(""),
  dateRange: z.string().min(1),
  amountOwed: z.string().min(1),
  currency: z.string().min(1),
  contactAttempts: z.number().int().min(0),
  rawStory: z.string().min(50),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return error("Authentication required", 401);
  }

  const ip = getClientIp(request);
  const { allowed } = await rateLimit(`ai-writing:${ip}`);
  if (!allowed) {
    return error("Rate limited. Please wait before trying again.", 429);
  }

  try {
    const body = await request.json();
    const parsed = writingAssistantSchema.safeParse(body);
    if (!parsed.success) {
      return error("Invalid input", 400);
    }

    const suggestion = await callOpenRouter({
      model: getWritingModel(),
      systemPrompt: WRITING_ASSISTANT_SYSTEM,
      userPrompt: WRITING_ASSISTANT_USER(parsed.data),
    });

    return success({ suggestion });
  } catch (err) {
    console.error("Writing assistant error:", err);
    return error("Failed to generate suggestion", 500);
  }
}
