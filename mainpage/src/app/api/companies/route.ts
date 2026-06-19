import { db } from "@/lib/db/client";
import { companies, cases } from "@/lib/db/schema";
import { sql, ilike, asc, desc, eq } from "drizzle-orm";
import { success, error, getClientIp } from "@/lib/utils/api";
import { rateLimit } from "@/lib/auth/rate-limit";

function escapeLike(value: string): string {
  return value.replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimit(`companies-list:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return error("Too many requests. Please try again later.", 429);
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().slice(0, 100);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      200,
      Math.max(1, Number(searchParams.get("limit")) || 50)
    );
    const offset = (page - 1) * limit;

    const baseQuery = db
      .select({
        slug: companies.slug,
        name: companies.name,
        vertical: companies.vertical,
        caseCount: sql<number>`COALESCE(COUNT(${cases.id}), 0)::int`,
      })
      .from(companies)
      .leftJoin(cases, eq(cases.companyId, companies.id))
      .where(q ? ilike(companies.name, `%${escapeLike(q)}%`) : undefined)
      .groupBy(companies.id, companies.slug, companies.name, companies.vertical);

    const rows = await baseQuery
      .orderBy(desc(sql<number>`COALESCE(COUNT(${cases.id}), 0)`), asc(companies.name))
      .limit(limit)
      .offset(offset);

    const response = success({ companies: rows });
    response.headers.set("Cache-Control", "public, s-maxage=60");
    return response;
  } catch (err) {
    console.error("Error listing companies:", err);
    return error("Failed to list companies", 500);
  }
}
