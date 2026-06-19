import { db } from "@/lib/db/client";
import { companies, cases } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Directory — Sindicato",
  description:
    "Browse companies reported on Sindicato's worker exploitation database.",
};

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const companyList = await db
    .select({
      id: companies.id,
      slug: companies.slug,
      name: companies.name,
      caseCount: sql<number>`COALESCE(COUNT(${cases.id}), 0)`,
    })
    .from(companies)
    .leftJoin(cases, eq(cases.companyId, companies.id))
    .groupBy(companies.id, companies.slug, companies.name)
    .orderBy(desc(sql`COALESCE(COUNT(${cases.id}), 0)`))
    .limit(limit)
    .offset(offset);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Company Directory</h1>
      <div className="grid gap-2">
        {companyList.map((c) => (
          <Link
            key={c.id}
            href={`/en/${c.slug}`}
            className="flex justify-between items-center rounded-lg border p-3 hover:bg-muted"
          >
            <span className="font-medium">{c.name}</span>
            <span className="text-sm text-muted-foreground">
              {c.caseCount} {c.caseCount === 1 ? "case" : "cases"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
