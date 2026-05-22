"use client";

import { useParams } from "next/navigation";
import CompanyPage from "@/app/sections/CompanyPage";

export default function WorkersCompanyPage() {
  const params = useParams<{ company: string }>();
  return <CompanyPage slug={params.company} vertical="remote" />;
}
