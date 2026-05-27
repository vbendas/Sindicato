import type { Metadata } from "next";
import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import CompanyPage from "@/app/sections/CompanyPage";

interface PageProps {
  params: Promise<{ company: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { company: slug } = await params;

  const [result] = await db
    .select({
      total: count(),
      companyName: companies.name,
    })
    .from(cases)
    .innerJoin(companies, eq(cases.companyId, companies.id))
    .where(and(eq(companies.slug, slug), eq(cases.status, "active")))
    .groupBy(companies.name)
    .limit(1);

  const companyName = result?.companyName ?? slug;
  const caseCount = result?.total ?? 0;

  const title = `${companyName} — ${caseCount} gig worker cases on Sindicato`;
  const description = `${caseCount} cases filed against ${companyName} by gig workers. Track wage theft reports and unpaid wages.`;
  const url = `https://sindicato.app/gig/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Sindicato",
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: `Sindicato — ${companyName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
  };
}

export default async function GigCompanyPage({ params }: PageProps) {
  const { company } = await params;
  return <CompanyPage slug={company} vertical="gig" />;
}
