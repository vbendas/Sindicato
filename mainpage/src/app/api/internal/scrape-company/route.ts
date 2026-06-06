import { db } from "@/lib/db/client";
import { companies, manualReviewQueue } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { success, error } from "@/lib/utils/api";
import { scrapeCompanyEmails } from "@/lib/scraper";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return error("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { companyId, companyWebsite, companyName } = body;

    if (!companyId) return error("companyId is required", 400);
    if (!companyWebsite) return error("companyWebsite is required", 400);

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company) return error("Company not found", 404);

    const { emails, source } = await scrapeCompanyEmails(companyWebsite, companyName);

    if (emails.length > 0) {
      const existingEmails = (company.contactEmails as string[]) || [];
      const mergedEmails = [...new Set([...existingEmails, ...emails])];

      await db
        .update(companies)
        .set({
          contactEmails: mergedEmails,
          scrapeStatus: "found",
          scrapedAt: new Date(),
          scrapeSource: source,
        })
        .where(eq(companies.id, companyId));

      return success({ emails: mergedEmails, source });
    }

    // No emails found — track attempts and possibly queue manual review
    const newAttempts = company.scrapeAttempts + 1;

    if (newAttempts >= 3) {
      await db
        .update(companies)
        .set({
          scrapeStatus: "manual_review",
          scrapeAttempts: newAttempts,
          scrapedAt: new Date(),
          scrapeSource: source,
        })
        .where(eq(companies.id, companyId));

      // Add to manual review queue if not already there
      const existingReview = await db
        .select()
        .from(manualReviewQueue)
        .where(eq(manualReviewQueue.companyId, companyId))
        .limit(1);

      if (existingReview.length === 0) {
        await db.insert(manualReviewQueue).values({
          companyId,
          reason: "no_emails_found",
        });
      }
    } else {
      await db
        .update(companies)
        .set({
          scrapeStatus: "not_scraped",
          scrapeAttempts: newAttempts,
          scrapedAt: new Date(),
          scrapeSource: source,
        })
        .where(eq(companies.id, companyId));
    }

    return success({ emails: [], source, attempts: newAttempts });
  } catch (err) {
    console.error("Scrape company failed:", err);
    return error("Internal server error", 500);
  }
}
