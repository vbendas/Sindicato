"use client";

import { LocalizedLink } from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n";

export default function PendingApprovalPage() {
  const t = useT();
  return (
    <main className="min-h-screen bg-sindicato-charcoal text-sindicato-warm-white flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 border-2 border-sindicato-warm-white/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-sindicato-warm-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-4 font-[family-name:var(--font-barlow)] uppercase tracking-wider">
          {t("pending.title")}
        </h1>

        <p className="text-sindicato-warm-white/65 leading-relaxed mb-8">
          {t("pending.body")}
        </p>

        <div className="border border-white/20 p-4 mb-8 text-left text-sm text-sindicato-warm-white/65 leading-relaxed">
          <p className="mb-2"><strong className="text-sindicato-warm-white">{t("pending.nextLabel")}</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>{t("pending.next1")}</li>
            <li>{t("pending.next2")}</li>
            <li>{t("pending.next3")}</li>
          </ol>
        </div>

        <LocalizedLink
          href="/"
          className="inline-block bg-sindicato-warm-white text-sindicato-charcoal px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-warm-white/90 transition-all font-[family-name:var(--font-barlow)]"
        >
          {t("pending.backHome")}
        </LocalizedLink>
      </div>
    </main>
  );
}
