import { franc } from "franc";
import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";
import { caseSubmissionSchema } from "@/lib/utils/schemas";
import { redactName } from "@/lib/utils/redaction";
import { verifyTurnstileToken } from "@/lib/utils/turnstile";
import { notifyCompanyNewCase } from "@/lib/email/notifications";
import { createCaseAlias } from "@/lib/email/aliases";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip);
  if (!rl.allowed) {
    return error("Too many requests. Please try again later.", 429);
  }

  try {
    const body = await request.json();

    const parsed = caseSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return error(
        "Validation failed. Please check your submission.",
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const data = parsed.data;

    const turnstileToken = body.turnstileToken as string | undefined;
    if (!turnstileToken) {
      return error("Human verification required.", 400);
    }
    const verified = await verifyTurnstileToken(turnstileToken);
    if (!verified) {
      return error("Human verification failed. Please try again.", 400);
    }

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.slug, data.companySlug))
      .limit(1);

    if (!company) {
      return error(
        `Company "${data.companySlug}" not found. Please check the name and try again.`,
        404
      );
    }

    const detectedLang = franc(data.story, { minLength: 50 });

    const [newCase] = await db
      .insert(cases)
      .values({
        companyId: company.id,
        vertical: data.vertical,
        displayName: data.displayName,
        country: data.country || null,
        ageRange: data.ageRange || null,
        sex: data.sex || null,
        project: data.project || null,
        dateRange: data.dateRange,
        amountOwed: data.amountOwed,
        currency: data.currency,
        contactAttempts: data.contactAttempts,
        story: data.story,
        email: data.email,
        translationLanguage: detectedLang,
        attested: true,
        turnstileVerified: !!turnstileToken,
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

    if (data.optInCompanyNotify) {
      notifyCompanyNewCase({
        companyEmail: company.contactEmails?.[0] || "",
        companyName: company.name,
        caseSummary: {
          workerName: redactName(data.displayName),
          country: data.country || "",
          amountOwed: data.amountOwed,
          currency: data.currency,
          caseId: newCase.id,
        },
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
    if (vertical && (vertical === "remote" || vertical === "gig")) {
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
