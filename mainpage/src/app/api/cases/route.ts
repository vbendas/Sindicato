import { franc } from "franc";
import { db } from "@/lib/db/client";
import { cases, companies, workers } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";
import { caseSubmissionSchema } from "@/lib/utils/schemas";
import { redactName, redactEmail } from "@/lib/utils/redaction";
import { notifyCompanyNewCase } from "@/lib/email/notifications";

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
      return error("Validation failed. Please check your submission.", 400);
    }

    const data = parsed.data;

    let companySlug = data.companySlug;
    if (!companySlug) {
      const [firstCompany] = await db.select().from(companies).limit(1);
      if (!firstCompany) {
        return error("No companies found in database", 404);
      }
      companySlug = firstCompany.slug;
    }

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.slug, companySlug))
      .limit(1);

    if (!company) {
      return error("Company not found", 404);
    }

    const [existingWorker] = await db
      .select()
      .from(workers)
      .where(eq(workers.email, data.email))
      .limit(1);

    let workerId: string;

    if (existingWorker) {
      workerId = existingWorker.id;
    } else {
      const [newWorker] = await db
        .insert(workers)
        .values({
          email: data.email,
          displayName: data.displayName,
          emailVerified: false,
        })
        .returning({ id: workers.id });
      workerId = newWorker.id;
    }

    const detectedLang = franc(data.story, { minLength: 50 });

    const [newCase] = await db
      .insert(cases)
      .values({
        workerId,
        companyId: company.id,
        vertical: data.vertical,
        displayName: data.displayName,
        country: data.country,
        projects: data.projects,
        dateRange: data.dateRange,
        amountOwed: data.amountOwed,
        currency: data.currency,
        contactAttempts: data.contactAttempts,
        story: data.story,
        email: data.email,
        claimTypes: data.claimTypes,
        otherDescription: data.otherDescription,
        attestation: data.attestation,
        consentLegal: data.consentLegal,
        consentCollective: data.consentCollective,
        translationLanguage: detectedLang,
        status: "active",
      })
      .returning({ id: cases.id });

    if (company.publicEmail) {
      const claimTypeLabels: string[] = [];
      if (data.claimTypes.unpaidWages) claimTypeLabels.push("Unpaid wages");
      if (data.claimTypes.unfairPractices) claimTypeLabels.push("Unfair practices");
      if (data.claimTypes.retaliation) claimTypeLabels.push("Retaliation");
      if (data.claimTypes.other) claimTypeLabels.push("Other");

      notifyCompanyNewCase({
        companyEmail: company.publicEmail,
        companyName: company.name,
        caseSummary: {
          workerName: redactName(data.displayName),
          country: data.country,
          amountOwed: data.amountOwed,
          currency: data.currency,
          claimTypes: claimTypeLabels,
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
        email: cases.email,
        country: cases.country,
        projects: cases.projects,
        dateRange: cases.dateRange,
        amountOwed: cases.amountOwed,
        currency: cases.currency,
        claimTypes: cases.claimTypes,
        story: cases.story,
        vertical: cases.vertical,
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
      email: redactEmail(row.email),
      country: row.country,
      projects: row.projects,
      dateRange: row.dateRange,
      amountOwed: row.amountOwed,
      currency: row.currency,
      claimTypes: row.claimTypes,
      story: row.story.length > 200
        ? row.story.slice(0, row.story.lastIndexOf(" ", 200)) + "..."
        : row.story,
      vertical: row.vertical,
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
