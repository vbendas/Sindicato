import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { rateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/utils/api";

const MAX_ROWS = 500;
const STORY_PREVIEW_LENGTH = 600;

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimit(`export-cases:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ ok: false, error: "Rate limit exceeded. Try again later." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const rows = await db
    .select({
      companyName: companies.name,
      companySlug: companies.slug,
      caseType: cases.caseType,
      vertical: cases.vertical,
      country: cases.country,
      currency: cases.currency,
      amountOwed: cases.amountOwed,
      status: cases.status,
      resolutionStatus: cases.resolutionStatus,
      createdAt: cases.createdAt,
      story: cases.story,
    })
    .from(cases)
    .innerJoin(companies, eq(cases.companyId, companies.id))
    .where(eq(cases.status, "active"))
    .orderBy(desc(cases.createdAt))
    .limit(MAX_ROWS);

  const header = [
    "Company Name",
    "Company Slug",
    "Case Type",
    "Vertical",
    "Country",
    "Currency",
    "Amount Owed",
    "Status",
    "Resolution",
    "Created At",
    "Story Preview",
  ];

  const csvRows = rows.map((row) => [
    escapeCSV(row.companyName ?? ""),
    escapeCSV(row.companySlug ?? ""),
    escapeCSV(row.caseType ?? ""),
    escapeCSV(row.vertical ?? ""),
    escapeCSV(row.country ?? ""),
    escapeCSV(row.currency ?? ""),
    escapeCSV(row.amountOwed?.toString() ?? "0"),
    escapeCSV(row.status ?? ""),
    escapeCSV(row.resolutionStatus ?? ""),
    escapeCSV(row.createdAt?.toISOString() ?? ""),
    escapeCSV((row.story ?? "").slice(0, STORY_PREVIEW_LENGTH)),
  ]);

  const csv = [header.join(","), ...csvRows.map((r) => r.join(","))].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      "X-RateLimit-Remaining": String(5 - (rl.retryAfterMs > 0 ? 1 : 0)),
    },
  });
}
