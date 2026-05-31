import { z } from "zod/v4";
import { success, error } from "@/lib/utils/api";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/utils/api";
import { callOpenRouter, getTagModel } from "@/lib/ai/openrouter";
import { TAG_EXTRACTION_SYSTEM } from "@/lib/ai/prompts";
import { getTagSeverity } from "@/lib/ai/tag-taxonomy";

const requestSchema = z.object({
  story: z.string().min(1).max(10000),
  timelineEvents: z
    .array(
      z.object({
        description: z.string().min(1).max(2000),
        eventDate: z.string(),
        direction: z
          .enum(["worker_to_company", "company_to_worker", "system"])
          .default("worker_to_company"),
      })
    )
    .default([]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return error("Authentication required.", 401);
  }

  const ip = getClientIp(request);
  const rl = await rateLimit(ip);
  if (!rl.allowed) {
    return error("Too many requests.", 429);
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return error("Invalid input", 400, parsed.error.flatten());
    }

    const { story, timelineEvents } = parsed.data;

    const timelineText =
      timelineEvents.length > 0
        ? `\n\nTimeline Events (in chronological order):\n${timelineEvents
            .map(
              (ev, i) =>
                `[${i + 1}] (${ev.direction === "worker_to_company" ? "Worker → Company" : ev.direction === "company_to_worker" ? "Company → Worker" : "System"}) ${ev.eventDate}:\n${ev.description}`
            )
            .join("\n\n")}`
        : "";

    const userPrompt = `Analyze the following worker case and extract all matching pattern tags.

--- BEGIN WORKER STORY ---
${story}
--- END WORKER STORY ---${timelineText}

Extract all pattern tags from both the story and timeline events. Return ONLY the JSON array.`;

    const raw = await callOpenRouter({
      model: getTagModel(),
      systemPrompt: TAG_EXTRACTION_SYSTEM,
      userPrompt,
      temperature: 0.2,
      maxTokens: 2048,
    });

    // Parse the response
    let extracted: unknown[] = [];
    try {
      const parsed = JSON.parse(raw.trim());
      if (Array.isArray(parsed)) extracted = parsed;
    } catch {
      let cleaned = raw.trim();
      if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
      else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
      if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) extracted = parsed;
      } catch {
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          try {
            const parsed = JSON.parse(arrayMatch[0]);
            if (Array.isArray(parsed)) extracted = parsed;
          } catch {}
        }
      }
    }

    // Filter valid tags with severity-based confidence thresholds
    interface ExtractedTag {
      category: string;
      tagName: string;
      confidence: number;
      sourceText: string;
    }
    const validTags: ExtractedTag[] = extracted.filter((t): t is ExtractedTag => {
      if (typeof t !== "object" || t === null) return false;
      const obj = t as Record<string, unknown>;
      if (
        typeof obj.tagName !== "string" ||
        typeof obj.sourceText !== "string" ||
        typeof obj.confidence !== "number" ||
        typeof obj.category !== "string"
      ) return false;
      if (obj.confidence < 0 || obj.confidence > 100) return false;
      // Severity-based minimum confidence
      const severity = getTagSeverity(obj.tagName as string);
      let minConfidence = 60;
      if (severity === "red") minConfidence = 80;
      else if (severity === "orange") minConfidence = 70;
      return (obj.confidence as number) >= minConfidence;
    });

    return success({ tags: validTags });
  } catch (err) {
    console.error("Error analyzing tags:", err);
    return error("Failed to analyze tags", 500);
  }
}
