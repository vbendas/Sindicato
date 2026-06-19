"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";

export function SimilarCases({ caseId }: { caseId: string }) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    fetch(`/api/cases/${caseId}/similar`)
      .then((r) => r.json())
      .then((d) => setCases(d.data?.similar || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return null;
  if (cases.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Similar cases
      </h3>
      <div className="space-y-1">
        {cases.map((c: any) => (
          <Link
            key={c.id}
            href={`/${locale}/cases/${c.id}`}
            className="block rounded-md border p-2 hover:bg-muted text-sm"
          >
            <span className="font-medium">{c.displayName}</span>
            <span className="text-muted-foreground"> — {c.companyName}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {c.matchCount} matching tags
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
