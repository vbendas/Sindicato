import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { redactName, redactEmail } from "@/lib/utils/redaction";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [row] = await db
      .select({
        id: cases.id,
        displayName: cases.displayName,
        email: cases.email,
        country: cases.country,
        projects: cases.projects,
        dateRange: cases.dateRange,
        amountOwed: cases.amountOwed,
        currency: cases.currency,
        contactAttempts: cases.contactAttempts,
        story: cases.story,
        claimTypes: cases.claimTypes,
        otherDescription: cases.otherDescription,
        status: cases.status,
        createdAt: cases.createdAt,
        companyName: companies.name,
        companySlug: companies.slug,
      })
      .from(cases)
      .innerJoin(companies, eq(cases.companyId, companies.id))
      .where(and(eq(cases.id, id), eq(cases.status, "active")))
      .limit(1);

    if (!row) {
      return error("Case not found", 404);
    }

    const data = {
      id: row.id,
      displayName: redactName(row.displayName),
      email: redactEmail(row.email),
      country: row.country,
      projects: row.projects,
      dateRange: row.dateRange,
      amountOwed: row.amountOwed,
      currency: row.currency,
      contactAttempts: row.contactAttempts,
      story: row.story,
      claimTypes: row.claimTypes,
      otherDescription: row.otherDescription,
      createdAt: row.createdAt,
      company: {
        name: row.companyName,
        slug: row.companySlug,
      },
    };

    return success(data);
  } catch (err) {
    console.error("Error fetching case:", err);
    return error("Failed to fetch case", 500);
  }
}
