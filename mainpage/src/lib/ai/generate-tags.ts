import { db } from "@/lib/db/client";
import {
  cases,
  caseTimelineEvents,
  caseTags,
  companies,
} from "@/lib/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
import { callOpenRouter, getTagModel } from "@/lib/ai/openrouter";
import {
  TAG_EXTRACTION_SYSTEM,
  TAG_EXTRACTION_USER,
} from "@/lib/ai/prompts";
import { getTagByName, TAG_CATEGORIES, TAG_TAXONOMY, type TagCategorySlug } from "@/lib/ai/tag-taxonomy";

interface ExtractedTag {
  category: string;
  tagName: string;
  confidence: number;
  sourceText: string;
}

export interface GenerateTagsResult {
  success: boolean;
  tagsGenerated: number;
  error?: string;
}

function extractJsonArray(raw: string): ExtractedTag[] | null {
  const trimmed = raw.trim();

  // Try direct parse first
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Strip markdown code blocks
  let cleaned = trimmed;
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Regex: find first JSON array in the text
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  return null;
}

function normalizeTagName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveCategory(tag: ExtractedTag): TagCategorySlug | "other" {
  // Check if AI returned a valid category
  if (
    tag.category &&
    TAG_CATEGORIES.includes(tag.category as TagCategorySlug)
  ) {
    return tag.category as TagCategorySlug;
  }

  // Try exact match
  const exact = getTagByName(tag.tagName);
  if (exact) {
    for (const cat of TAG_CATEGORIES) {
      if (TAG_TAXONOMY[cat].tags.some((t) => t.name === exact.name)) {
        return cat;
      }
    }
  }

  // Fuzzy match by normalized name
  const normalized = normalizeTagName(tag.tagName);
  for (const cat of TAG_CATEGORIES) {
    for (const def of TAG_TAXONOMY[cat].tags) {
      if (normalizeTagName(def.name) === normalized) {
        return cat;
      }
    }
  }

  return "other";
}

export async function generateCaseTags(
  caseId: string
): Promise<GenerateTagsResult> {
  console.log(`[tags] Starting tag generation for case ${caseId}`);

  const [caseRow] = await db
    .select({
      story: cases.story,
      companyId: cases.companyId,
    })
    .from(cases)
    .where(and(eq(cases.id, caseId), eq(cases.status, "active")))
    .limit(1);

  if (!caseRow) {
    console.warn(`[tags] Case ${caseId} not found or not active`);
    return { success: false, tagsGenerated: 0, error: "Case not found" };
  }

  const [company] = await db
    .select({ name: companies.name })
    .from(companies)
    .where(eq(companies.id, caseRow.companyId))
    .limit(1);

  if (!company) {
    console.warn(`[tags] Company not found for case ${caseId}`);
    return { success: false, tagsGenerated: 0, error: "Company not found" };
  }

  const events = await db
    .select({
      description: caseTimelineEvents.description,
      eventDate: caseTimelineEvents.eventDate,
      direction: caseTimelineEvents.direction,
      id: caseTimelineEvents.id,
    })
    .from(caseTimelineEvents)
    .where(eq(caseTimelineEvents.caseId, caseId))
    .orderBy(asc(caseTimelineEvents.eventDate));

  console.log(
    `[tags] Analyzing case ${caseId}: story length=${caseRow.story.length}, events=${events.length}, model=${getTagModel()}`
  );

  let raw: string;
  try {
    raw = await callOpenRouter({
      model: getTagModel(),
      systemPrompt: TAG_EXTRACTION_SYSTEM,
      userPrompt: TAG_EXTRACTION_USER({
        companyName: company.name,
        caseStory: caseRow.story,
        timelineEvents: events.map((ev) => ({
          description: ev.description,
          eventDate: ev.eventDate.toISOString(),
          direction: ev.direction,
        })),
      }),
      temperature: 0.2,
      maxTokens: 2048,
    });
  } catch (err) {
    console.error(`[tags] OpenRouter API call failed for case ${caseId}:`, err);
    return { success: false, tagsGenerated: 0, error: "AI API call failed" };
  }

  console.log(
    `[tags] Raw AI response (first 500 chars): ${raw.slice(0, 500)}`
  );

  const extracted = extractJsonArray(raw);

  if (!extracted) {
    console.error(
      `[tags] Failed to parse JSON from AI response for case ${caseId}. Full response:`,
      raw
    );
    return {
      success: false,
      tagsGenerated: 0,
      error: "AI returned invalid JSON",
    };
  }

  console.log(`[tags] Parsed ${extracted.length} raw tags from AI`);

  if (extracted.length === 0) {
    console.log(`[tags] No tags detected for case ${caseId}`);
    return { success: true, tagsGenerated: 0 };
  }

  const validTags = extracted.filter((t) => {
    if (!t.tagName || !t.sourceText) return false;
    if (typeof t.confidence !== "number" || t.confidence < 60 || t.confidence > 100) return false;
    return true;
  });

  console.log(
    `[tags] ${validTags.length} valid tags after filtering (from ${extracted.length} raw)`
  );

  if (validTags.length === 0) {
    // Log what was rejected and why
    for (const t of extracted) {
      const reasons: string[] = [];
      if (!t.tagName) reasons.push("missing tagName");
      if (!t.sourceText) reasons.push("missing sourceText");
      if (typeof t.confidence !== "number") reasons.push("confidence not a number");
      else if (t.confidence < 60) reasons.push(`confidence ${t.confidence} < 60`);
      console.warn(
        `[tags] Rejected tag: ${JSON.stringify(t)} — reasons: ${reasons.join(", ")}`
      );
    }
    return { success: true, tagsGenerated: 0 };
  }

  // Delete existing non-override tags
  await db
    .delete(caseTags)
    .where(
      and(eq(caseTags.caseId, caseId), isNull(caseTags.workerOverride))
    );

  const tagRows = validTags.map((t) => ({
    caseId,
    category: resolveCategory(t),
    tagName: t.tagName.trim(),
    confidence: Math.min(100, Math.max(0, Math.round(t.confidence))),
    sourceText: t.sourceText.trim(),
  }));

  await db.insert(caseTags).values(tagRows);

  console.log(
    `[tags] Inserted ${tagRows.length} tags for case ${caseId}: ${tagRows.map((t) => t.tagName).join(", ")}`
  );

  return { success: true, tagsGenerated: tagRows.length };
}
