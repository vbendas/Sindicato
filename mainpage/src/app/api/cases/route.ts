import { franc } from "franc";
import { db } from "@/lib/db/client";
import { cases, companies, caseTimelineEvents, caseTags } from "@/lib/db/schema";
import { eq, and, desc, count, ilike } from "drizzle-orm";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";
import { caseSubmissionV2Schema } from "@/lib/utils/schemas";
import { redactName } from "@/lib/utils/redaction";
import { verifyTurnstileToken } from "@/lib/utils/turnstile";
import { notifyCompanyNewCase } from "@/lib/email/notifications";
import { createCaseAlias } from "@/lib/email/aliases";
import { auth } from "@/lib/auth";
import { translateToEnglish } from "@/lib/ai/translate";
import { generateCaseTags } from "@/lib/ai/generate-tags";

export async function POST(request: Request) {
  // Require authenticated session
  const session = await auth();
  if (!session?.user?.id) {
    return error("Authentication required. Please verify your email first.", 401);
  }
  const workerId = session.user.id;

  const ip = getClientIp(request);
  const rl = await rateLimit(ip);
  if (!rl.allowed) {
    return error("Too many requests. Please try again later.", 429);
  }

  try {
    const body = await request.json();

    const parsed = caseSubmissionV2Schema.safeParse(body);
    if (!parsed.success) {
      return error(
        "Validation failed. Please check your submission.",
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const data = parsed.data;

    if (data.turnstileToken) {
      const verified = await verifyTurnstileToken(data.turnstileToken);
      if (!verified) {
        return error("Human verification failed. Please try again.", 400);
      }
    }

    // Look up company by slug (case-insensitive), create if not found
    let [company] = await db
      .select()
      .from(companies)
      .where(ilike(companies.slug, data.companySlug))
      .limit(1);

    if (!company) {
      const companyRl = await rateLimit(`company-create:${workerId}`, 3, 3600_000);
      if (!companyRl.allowed) {
        return error("Company creation rate limit reached. Please try again later.", 429);
      }

      const slugRegex = /^[a-z0-9-]{1,100}$/;
      if (!slugRegex.test(data.companySlug)) {
        return error("Invalid company slug format", 400);
      }

      const nameRegex = /^[a-zA-Z0-9\s.,&'-]{1,255}$/;
      if (!nameRegex.test(data.companyName)) {
        return error("Invalid company name format", 400);
      }

      [company] = await db
        .insert(companies)
        .values({
          slug: data.companySlug,
          name: data.companyName,
          vertical: data.vertical,
        })
        .returning();
    }

    const detectedLang = franc(data.story, { minLength: 50 });

    let storyTranslated: string | null = null;
    if (detectedLang !== "eng" && detectedLang !== "und") {
      try {
        storyTranslated = await translateToEnglish(data.story, detectedLang);
      } catch (err) {
        console.error("Auto-translation failed:", err);
      }
    }

    const dateRange = [data.workDateStart, data.workDateEnd]
      .filter(Boolean)
      .map((d) => new Date(d!).toLocaleDateString("en-US", { month: "short", year: "numeric" }))
      .join(" – ") || "Not specified";

    // Compute contactAttempts from timeline events
    const contactAttempts = data.timelineEvents.length;

    const [newCase] = await db
      .insert(cases)
      .values({
        companyId: company.id,
        workerId: workerId,
        vertical: data.vertical,
        caseType: data.caseType,
        displayName: data.displayName,
        country: data.country || null,
        ageRange: data.ageRange || null,
        sex: data.sex || null,
        project: data.project || null,
        dateRange,
        workDateStart: data.workDateStart ? new Date(data.workDateStart) : null,
        workDateEnd: data.workDateEnd ? new Date(data.workDateEnd) : null,
        amountOwed: data.amountOwed || "0",
        currency: data.currency,
        contactAttempts,
        story: data.story,
        storyTranslated,
        email: data.email,
        translationLanguage: detectedLang,
        attested: true,
        turnstileVerified: !!data.turnstileToken,
        optInSolicitor: data.optInSolicitor,
        optInCollective: data.optInCollective,
        optInCompanyNotify: data.optInCompanyNotify,
        optInCompanyContact: data.optInCompanyContact,
        status: "active",
      })
      .returning({ id: cases.id });

    try {
      const alias = await createCaseAlias(newCase.id, data.email);
      await db
        .update(cases)
        .set({ contactAlias: alias })
        .where(eq(cases.id, newCase.id));
    } catch (err) {
      console.error("Failed to create alias:", err);
    }

    // Insert worker-provided timeline events
    if (data.timelineEvents.length > 0) {
      await db.insert(caseTimelineEvents).values(
        data.timelineEvents.map((ev) => ({
          caseId: newCase.id,
          workerId: workerId,
          eventType: ev.eventType,
          eventDate: new Date(ev.eventDate),
          description: ev.description,
          responseReceived: ev.responseReceived,
        }))
      );
    }

    // Auto-log case filed event
    await db.insert(caseTimelineEvents).values({
      caseId: newCase.id,
      eventType: "case_updated" as const,
      eventDate: new Date(),
      description: `Case filed against ${company.name}. ${data.amountOwed ? `Amount owed: ${data.amountOwed} ${data.currency}.` : ""}`,
      responseReceived: false,
      isAutomatic: true,
    }).catch((err) => console.error("Failed to log case filed event:", err));

    // Auto-insert user-selected tags from filing wizard
    if (data.selectedTags && data.selectedTags.length > 0) {
      const userTagRows = data.selectedTags.map((tagName: string) => ({
        caseId: newCase.id,
        category: "other" as const,
        tagName: tagName.trim(),
        confidence: 100,
        sourceText: "Selected by worker during case filing",
        source: "user" as const,
      }));
      await db.insert(caseTags).values(userTagRows).catch((err) =>
        console.error("Failed to insert user-selected tags:", err)
      );
    }

    // Auto-tag based on form selections
    const autoTagRows: Array<{
      caseId: string;
      category: string;
      tagName: string;
      confidence: number;
      sourceText: string;
      source: string;
    }> = [];

    if (data.optInCollective) {
      autoTagRows.push({
        caseId: newCase.id,
        category: "worker_action",
        tagName: "Collective action interest",
        confidence: 100,
        sourceText: "Worker opted in to collective action during case filing",
        source: "auto",
      });
    }

    if (data.optInSolicitor) {
      autoTagRows.push({
        caseId: newCase.id,
        category: "worker_action",
        tagName: "Open to legal representation",
        confidence: 100,
        sourceText: "Worker opted in to be contacted by lawyers during case filing",
        source: "auto",
      });
    }

    if (autoTagRows.length > 0) {
      await db.insert(caseTags).values(autoTagRows).catch((err) =>
        console.error("Failed to insert auto-tags:", err)
      );
    }

    // Insert AI tags from the filing wizard (pre-computed during review step)
    if (data.aiTags && data.aiTags.length > 0) {
      const aiTagRows = data.aiTags.map((t) => ({
        caseId: newCase.id,
        category: t.category,
        tagName: t.tagName.trim(),
        confidence: Math.min(100, Math.max(0, Math.round(t.confidence))),
        sourceText: t.sourceText.trim(),
        source: "ai" as const,
      }));
      await db.insert(caseTags).values(aiTagRows).catch((err) =>
        console.error("Failed to insert AI tags from payload:", err)
      );
    } else {
      // Fallback: generate AI tags fire-and-forget if not pre-computed
      generateCaseTags(newCase.id).catch((err) =>
        console.error("Failed to generate case tags:", err)
      );
    }

    if (data.optInCompanyNotify) {
      notifyCompanyNewCase({
        companyEmail: company.contactEmails?.[0] || "",
        companyName: company.name,
        caseSummary: {
          workerName: redactName(data.displayName),
          country: data.country || "",
          amountOwed: data.amountOwed || "0",
          currency: data.currency,
          caseId: newCase.id,
        },
      }).then(() => {
        db.insert(caseTimelineEvents).values({
          caseId: newCase.id,
          eventType: "email_sent" as const,
          eventDate: new Date(),
          description: `Sindicato sent notification email to ${company.name}.`,
          responseReceived: false,
          isAutomatic: true,
        }).catch((err) => console.error("Failed to log notification event:", err));
      }).catch((err) => console.error("Failed to notify company:", err));
    }

    return success({ id: newCase.id }, 201);
  } catch (err) {
    console.error("Error submitting case:", err);
    return error("Failed to submit case", 500);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const companySlug = searchParams.get("company") || undefined;
    const vertical = searchParams.get("vertical") || undefined;

    const offset = (page - 1) * limit;

    const conditions = [eq(cases.status, "active")];
    if (companySlug) {
      conditions.push(eq(companies.slug, companySlug));
    }
    if (vertical) {
      conditions.push(eq(cases.vertical, vertical));
    }

    const whereClause = and(...conditions);

    const [countResult] = await db
      .select({ total: count() })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(whereClause);

    const total = countResult?.total ?? 0;

    const rows = await db
      .select({
        id: cases.id,
        displayName: cases.displayName,
        country: cases.country,
        project: cases.project,
        dateRange: cases.dateRange,
        amountOwed: cases.amountOwed,
        currency: cases.currency,
        ageRange: cases.ageRange,
        sex: cases.sex,
        contactAlias: cases.contactAlias,
        story: cases.story,
        storyTranslated: cases.storyTranslated,
        translationLanguage: cases.translationLanguage,
        vertical: cases.vertical,
        resolutionStatus: cases.resolutionStatus,
        createdAt: cases.createdAt,
        companyName: companies.name,
        companySlug: companies.slug,
      })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(whereClause)
      .orderBy(desc(cases.createdAt))
      .limit(limit)
      .offset(offset);

    const data = rows.map((row) => ({
      id: row.id,
      displayName: redactName(row.displayName),
      country: row.country,
      project: row.project,
      dateRange: row.dateRange,
      amountOwed: row.amountOwed,
      currency: row.currency,
      ageRange: row.ageRange,
      sex: row.sex,
      contactAlias: row.contactAlias,
      story: row.story,
      storyTranslated: row.storyTranslated,
      translationLanguage: row.translationLanguage,
      vertical: row.vertical,
      resolutionStatus: row.resolutionStatus,
      createdAt: row.createdAt,
      company: {
        name: row.companyName,
        slug: row.companySlug,
      },
    }));

    return success({
      cases: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching cases:", err);
    return error("Failed to fetch cases", 500);
  }
}
