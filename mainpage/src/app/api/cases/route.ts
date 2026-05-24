import { franc } from "franc";
import { db } from "@/lib/db/client";
import { cases, companies, caseTimelineEvents } from "@/lib/db/schema";
import { eq, and, desc, count, ilike } from "drizzle-orm";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";
import { caseSubmissionV2Schema } from "@/lib/utils/schemas";
import { redactName } from "@/lib/utils/redaction";
import { verifyTurnstileToken } from "@/lib/utils/turnstile";
import { notifyCompanyNewCase } from "@/lib/email/notifications";
import { createCaseAlias } from "@/lib/email/aliases";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  // Require authenticated session
  const session = await auth();
  if (!session?.user?.id) {
    return error("Authentication required. Please verify your email first.", 401);
  }
  const workerId = session.user.id;

  const ip = getClientIp(request);
  const rl = rateLimit(ip);
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

    // Build dateRange string for backward compat
    const dateRange = [data.workDateStart, data.workDateEnd]
      .filter(Boolean)
      .map((d) => new Date(d!).toLocaleDateString("en-US", { month: "short", year: "numeric" }))
      .join(" – ") || "Not specified";

    // Compute contactAttempts from timeline events
    const contactAttempts = data.timelineEvents.length;
    // Compute daysWithoutAnswer: days since the latest event without a response
    let daysWithoutAnswer: number | null = null;
    const unansweredEvents = data.timelineEvents.filter((ev) => !ev.responseReceived);
    if (unansweredEvents.length > 0) {
      const latest = new Date(
        Math.max(...unansweredEvents.map((ev) => new Date(ev.eventDate).getTime()))
      );
      daysWithoutAnswer = Math.floor(
        (Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

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
        email: data.email,
        translationLanguage: detectedLang,
        attested: true,
        turnstileVerified: !!data.turnstileToken,
        optInSolicitor: data.optInSolicitor,
        optInCollective: data.optInCollective,
        optInCompanyNotify: data.optInCompanyNotify,
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
    }).catch((err) => console.error("Failed to log case filed event:", err));

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
