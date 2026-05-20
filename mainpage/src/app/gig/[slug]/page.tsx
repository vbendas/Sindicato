"use client";

import { useParams } from "next/navigation";
import CompanyPage from "@/app/sections/CompanyPage";

export default function GigCompany() {
  const params = useParams<{ slug: string }>();
  return <CompanyPage slug={params.slug} vertical="gig" />;
}
