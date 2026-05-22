"use client";

import { useParams } from "next/navigation";
import CompanyPage from "@/app/sections/CompanyPage";

export default function GigCompanyPage() {
  const params = useParams<{ company: string }>();
  return <CompanyPage slug={params.company} vertical="gig" />;
}
