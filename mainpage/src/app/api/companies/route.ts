import { db } from "@/lib/db/client";
import { companies, cases } from "@/lib/db/schema";
import { sql, ilike, asc, desc } from "drizzle-orm";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimit(`companies-list:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return error("Too many requests. Please try again later.", 429);
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().slice(0, 100);
    const limit = Math.min(
      200,
      Math.max(1, Number(searchParams.get("limit")) || 200)
    );

    const caseCountCol = sql<number>`(SELECT COUNT(*) FROM ${cases} WHERE ${cases.companyId} = ${companies.id})::int`;

    const rows = await db
      .select({
        slug: companies.slug,
        name: companies.name,
        vertical: companies.vertical,
        caseCount: caseCountCol,
      })
      .from(companies)
      .where(q ? ilike(companies.name, `%${q}%`) : undefined)
      .orderBy(desc(caseCountCol), asc(companies.name))
      .limit(limit);

    return success({ companies: rows });
  } catch (err) {
    console.error("Error listing companies:", err);
    return error("Failed to list companies", 500);
  }
}
