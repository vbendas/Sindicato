import { db } from "@/lib/db/client";
import { manualReviewQueue, companies } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { success, error, verifyBearerSecret } from "@/lib/utils/api";

function checkAuth(request: Request) {
  if (!verifyBearerSecret(request.headers.get("Authorization"), process.env.CRON_SECRET)) {
    return error("Unauthorized", 401);
  }
  return null;
}

export async function GET(request: Request) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "pending";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, parseInt(url.searchParams.get("pageSize") || "20", 10));

  try {
    const items = await db
      .select({
        id: manualReviewQueue.id,
        companyId: manualReviewQueue.companyId,
        reason: manualReviewQueue.reason,
        status: manualReviewQueue.status,
        adminNotes: manualReviewQueue.adminNotes,
        resolvedEmails: manualReviewQueue.resolvedEmails,
        createdAt: manualReviewQueue.createdAt,
        resolvedAt: manualReviewQueue.resolvedAt,
        companyName: companies.name,
        companySlug: companies.slug,
        companyWebsite: companies.website,
        currentEmails: companies.contactEmails,
      })
      .from(manualReviewQueue)
      .innerJoin(companies, eq(manualReviewQueue.companyId, companies.id))
      .where(eq(manualReviewQueue.status, status as "pending" | "resolved" | "dismissed"))
      .orderBy(desc(manualReviewQueue.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return success({ items, page, pageSize });
  } catch (err) {
    console.error("Failed to fetch review queue:", err);
    return error("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { reviewId, emails, action, notes } = body;

    if (!reviewId) return error("reviewId is required", 400);

    const [review] = await db
      .select()
      .from(manualReviewQueue)
      .where(eq(manualReviewQueue.id, reviewId))
      .limit(1);

    if (!review) return error("Review item not found", 404);

    if (action === "resolve") {
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return error("emails array is required when resolving", 400);
      }

      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, review.companyId))
        .limit(1);

      if (company) {
        const existing = (company.contactEmails as string[]) || [];
        const merged = [...new Set([...existing, ...emails])];

        await db
          .update(companies)
          .set({
            contactEmails: merged,
            scrapeStatus: "found",
            scrapeSource: "manual",
            scrapedAt: new Date(),
          })
          .where(eq(companies.id, review.companyId));
      }

      await db
        .update(manualReviewQueue)
        .set({
          status: "resolved",
          resolvedEmails: emails,
          adminNotes: notes || null,
          resolvedAt: new Date(),
        })
        .where(eq(manualReviewQueue.id, reviewId));

      return success({ resolved: true });
    }

    if (action === "dismiss") {
      await db
        .update(manualReviewQueue)
        .set({
          status: "dismissed",
          adminNotes: notes || null,
          resolvedAt: new Date(),
        })
        .where(eq(manualReviewQueue.id, reviewId));

      return success({ dismissed: true });
    }

    return error("Invalid action. Use 'resolve' or 'dismiss'.", 400);
  } catch (err) {
    console.error("Failed to process review:", err);
    return error("Internal server error", 500);
  }
}
