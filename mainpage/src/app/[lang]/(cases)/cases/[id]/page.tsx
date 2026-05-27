import type { Metadata } from "next";
import { db } from "@/lib/db/client";
import { cases, companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import CaseDetailClient from "./CaseDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const [caseRow] = await db
    .select({
      displayName: cases.displayName,
      country: cases.country,
      amountOwed: cases.amountOwed,
      currency: cases.currency,
      story: cases.story,
      companyName: companies.name,
      companySlug: companies.slug,
    })
    .from(cases)
    .innerJoin(companies, eq(cases.companyId, companies.id))
    .where(eq(cases.id, id))
    .limit(1);

  if (!caseRow) {
    return {
      title: "Case Not Found — Sindicato",
      description: "This case may have been removed or does not exist.",
    };
  }

  const currencySymbol = { EUR: "€", USD: "$", GBP: "£", BRL: "R$", INR: "₹" }[caseRow.currency] ?? caseRow.currency;
  const title = `Worker from ${caseRow.country} owed ${currencySymbol}${caseRow.amountOwed} by ${caseRow.companyName} — Sindicato`;
  const description = caseRow.story.slice(0, 200);
  const url = `https://sindicato.app/cases/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "Sindicato",
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: `Sindicato Case`,
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

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const shareUrl = `https://sindicato.app/cases/${id}`;

  return <CaseDetailClient caseId={id} shareUrl={shareUrl} />;
}
