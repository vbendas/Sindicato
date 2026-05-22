"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type { CaseFormData, TimelineEvent } from "../FilingWizard";

const CASE_TYPE_LABELS: Record<string, string> = {
  unpaid_wages: "Unpaid Wages",
  late_payment: "Late Payment",
  sudden_deactivation: "Sudden Deactivation",
  unfair_review: "Unfair Performance Review",
  predatory_practices: "Predatory Practices",
  harassment: "Harassment",
  retaliation: "Retaliation",
  contract_violation: "Contract Violation",
  data_privacy: "Data / Privacy Issue",
  other: "Other",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  email_sent: "Email Sent",
  no_response: "No Response",
  canned_response: "Canned / Template Response",
  chat_support: "Support Chat",
  phone_call: "Phone Call",
  legal_notice: "Legal Notice",
  payment_partial: "Partial Payment Received",
  case_updated: "Case Updated",
  resolved: "Resolved",
  other: "Other",
};

const rowLabelClass =
  "text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold text-sindicato-charcoal/50";
const rowValueClass = "text-sm text-sindicato-charcoal mt-0.5";

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="py-3 border-b border-sindicato-charcoal/10 last:border-0">
      <p className={rowLabelClass}>{label}</p>
      <p className={rowValueClass}>{value}</p>
    </div>
  );
}

interface ReviewStepProps {
  email: string;
  workerId: string;
  caseData: CaseFormData;
  timelineEvents: TimelineEvent[];
  onBack: () => void;
}

export default function ReviewStep({ email, caseData, timelineEvents, onBack }: ReviewStepProps) {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [caseId, setCaseId] = useState("");

  const workPeriod =
    caseData.workDateStart && caseData.workDateEnd
      ? `${format(caseData.workDateStart, "MMM yyyy")} – ${format(caseData.workDateEnd, "MMM yyyy")}`
      : caseData.workDateStart
      ? `From ${format(caseData.workDateStart, "MMM yyyy")}`
      : "";

  async function handleSubmit() {
    setSubmitError("");
    setLoading(true);

    try {
      // Execute Turnstile if token not yet acquired
      let token = turnstileToken;
      if (!token && turnstileRef.current) {
        turnstileRef.current.execute();
        // Wait briefly for token to be set via onSuccess callback
        await new Promise<void>((resolve) => setTimeout(resolve, 1500));
        token = turnstileToken;
      }

      const payload = {
        vertical: caseData.vertical,
        caseType: caseData.caseType || "other",
        displayName: caseData.displayName,
        companySlug: caseData.companySlug,
        companyName: caseData.companyName,
        country: caseData.country,
        ageRange: caseData.ageRange || undefined,
        sex: caseData.sex || undefined,
        project: caseData.project || undefined,
        workDateStart: caseData.workDateStart?.toISOString(),
        workDateEnd: caseData.workDateEnd?.toISOString(),
        amountOwed: caseData.amountOwed || undefined,
        currency: "USD",
        contactAttempts: Number(caseData.contactAttempts) || 0,
        story: caseData.story,
        email,
        optInSolicitor: caseData.optInSolicitor,
        optInCollective: caseData.optInCollective,
        optInCompanyNotify: caseData.optInCompanyNotify,
        attested: true as const,
        timelineEvents: timelineEvents.map((ev) => ({
          eventType: ev.eventType,
          eventDate: ev.eventDate.toISOString(),
          description: ev.description,
          responseReceived: ev.responseReceived,
        })),
        turnstileToken: token || undefined,
      };

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Submission failed. Please try again.");
        turnstileRef.current?.reset();
        setTurnstileToken("");
        return;
      }

      setCaseId(data.data?.id || "");
      setSubmitted(true);

      setTimeout(() => router.push("/cases"), 4000);
    } catch {
      setSubmitError("Network error. Please try again.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white border border-sindicato-charcoal/10 p-8 text-center">
          <div className="w-12 h-12 bg-sindicato-bordeaux/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-sindicato-bordeaux" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-sindicato-charcoal font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-2">
            Case filed
          </h2>
          <p className="text-sindicato-charcoal/60 text-sm mb-1">
            Your case has been recorded.
          </p>
          {caseId && (
            <p className="text-xs text-sindicato-charcoal/40 font-mono">
              #{caseId.slice(-8).toUpperCase()}
            </p>
          )}
          <p className="text-sindicato-charcoal/40 text-xs mt-6">
            Redirecting to all cases...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white border border-sindicato-charcoal/10 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-sindicato-charcoal font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-1">
          Review your case
        </h2>
        <p className="text-sindicato-charcoal/60 text-sm mb-8">
          Please review the details below before submitting.
        </p>

        <div className="bg-sindicato-parchment/40 border border-sindicato-charcoal/10 p-4 sm:p-6 mb-6">
          <SummaryRow label="Email" value={email} />
          <SummaryRow
            label="Platform"
            value={caseData.vertical === "remote" ? "Remote Platform" : caseData.vertical === "gig" ? "Gig Delivery" : ""}
          />
          <SummaryRow label="Company" value={caseData.companyName} />
          <SummaryRow label="Case type" value={CASE_TYPE_LABELS[caseData.caseType] || caseData.caseType} />
          <SummaryRow label="Your name" value={caseData.displayName} />
          <SummaryRow label="Country" value={caseData.country} />
          <SummaryRow label="Work period" value={workPeriod} />
          {caseData.amountOwed && (
            <SummaryRow label="Amount owed" value={`$${caseData.amountOwed} USD`} />
          )}
          <SummaryRow label="Contact attempts" value={caseData.contactAttempts} />
          {caseData.project && (
            <SummaryRow label="Project" value={caseData.project} />
          )}
          {caseData.story && (
            <div className="py-3 border-b border-sindicato-charcoal/10 last:border-0">
              <p className={rowLabelClass}>Your story</p>
              <p className={`${rowValueClass} line-clamp-4 whitespace-pre-wrap`}>
                {caseData.story}
              </p>
            </div>
          )}
        </div>

        {timelineEvents.length > 0 && (
          <div className="mb-6">
            <p className={`${rowLabelClass} mb-3`}>Timeline ({timelineEvents.length} event{timelineEvents.length !== 1 ? "s" : ""})</p>
            <div className="space-y-2">
              {timelineEvents.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 text-sm">
                  <span className="text-sindicato-bordeaux font-bold text-xs font-[family-name:var(--font-barlow)] uppercase tracking-wider mt-0.5 shrink-0">
                    {EVENT_TYPE_LABELS[ev.eventType] || ev.eventType}
                  </span>
                  <span className="text-sindicato-charcoal/50 shrink-0">
                    {format(ev.eventDate, "d MMM yyyy")}
                  </span>
                  <span className="text-sindicato-charcoal/70 line-clamp-1">{ev.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invisible Turnstile */}
        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
          onSuccess={(token) => setTurnstileToken(token)}
          options={{ theme: "light", size: "invisible", execution: "execute" }}
        />

        {submitError && (
          <p className="text-xs text-red-600 mb-4">{submitError}</p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-sindicato-bordeaux text-sindicato-cream py-3 px-6 font-bold uppercase tracking-wider hover:bg-sindicato-bordeaux-dark transition-colors font-[family-name:var(--font-barlow)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Case"}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="text-sindicato-charcoal/60 hover:text-sindicato-charcoal transition-colors text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold"
            >
              Back
            </button>
          </div>
        </div>

        <p className="text-xs text-sindicato-charcoal/40 text-center mt-4">
          By submitting, you confirm your case details are accurate and truthful.
        </p>
      </div>
    </motion.div>
  );
}
