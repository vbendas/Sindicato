"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useLocale, useT } from "@/lib/i18n";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type { CaseFormData, TimelineEvent } from "../FilingWizard";
import {
  TAG_TAXONOMY,
  TAG_CATEGORIES,
  type TagSeverity,
} from "@/lib/ai/tag-taxonomy";

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

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "\u20ac",
  GBP: "\u00a3",
  BRL: "R$",
  INR: "\u20b9",
  CAD: "C$",
  AUD: "A$",
  JPY: "\u00a5",
};

const SEVERITY_DOT_COLORS: Record<TagSeverity, string> = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  orange: "bg-orange-400",
  red: "bg-rose-400",
};

const SEVERITY_COLORS: Record<TagSeverity, { bg: string; text: string; border: string }> = {
  green: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  yellow: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  red: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
};

const rowLabelClass =
  "text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold text-sindicato-warm-white/50";
const rowValueClass = "text-sm text-sindicato-warm-white mt-0.5";

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="py-3 border-b border-white/10 last:border-0">
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

export default function ReviewStep({ email: propEmail, workerId: propWorkerId, caseData, timelineEvents, onBack }: ReviewStepProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useT();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [caseId, setCaseId] = useState("");

  // Donation state
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;
  const stripePromise = useMemo<Promise<StripeJs | null> | null>(() => {
    if (!stripePublishableKey) return null;
    return loadStripe(stripePublishableKey);
  }, [stripePublishableKey]);
  const [donateAmountEur, setDonateAmountEur] = useState<number>(25);
  const [donateClientSecret, setDonateClientSecret] = useState<string | null>(null);
  const [donateLoading, setDonateLoading] = useState(false);
  const [donateError, setDonateError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Inline email verification for unauthenticated users
  const [verifyStep, setVerifyStep] = useState<"idle" | "sent" | "verified">("idle");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [localWorkerId, setLocalWorkerId] = useState("");
  const [localEmail, setLocalEmail] = useState("");

  const hasSession = !!propWorkerId;
  const resolvedWorkerId = propWorkerId || localWorkerId;
  const resolvedEmail = propEmail || localEmail;

  const contactAttemptsFromTimeline = timelineEvents.length;

  // Compute auto-selected tags from form selections
  const autoSelectedTags = useMemo(() => {
    const tags: string[] = [];
    if (caseData.optInCollective) tags.push("Collective action interest");
    if (caseData.optInSolicitor) tags.push("Open to legal representation");
    return tags;
  }, [caseData.optInCollective, caseData.optInSolicitor]);

  // Initialize selected tags: user selections + auto-detected
  const [selectedTags, setSelectedTags] = useState<Set<string>>(() => {
    const initial = new Set(caseData.selectedTags);
    autoSelectedTags.forEach((t) => initial.add(t));
    return initial;
  });

  // AI tag analysis
  interface AIDetectedTag {
    category: string;
    tagName: string;
    confidence: number;
    sourceText: string;
  }
  const [aiTags, setAiTags] = useState<AIDetectedTag[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Auto-run AI analysis on mount and when story/timeline changes
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!caseData.story || caseData.story.trim().length < 50) return;
      setAiLoading(true);
      setAiError(null);
      try {
        const res = await fetch("/api/ai/analyze-tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            story: caseData.story,
            timelineEvents: timelineEvents.map((ev) => ({
              description: ev.description,
              eventDate: ev.eventDate.toISOString(),
              direction: "worker_to_company",
            })),
          }),
        });
        const data = await res.json();
        if (!cancelled && res.ok && data.data?.tags) {
          setAiTags(data.data.tags);
          setSelectedTags((prev) => {
            const next = new Set(prev);
            for (const tag of data.data.tags) {
              next.add(tag.tagName);
            }
            return next;
          });
        } else if (!cancelled) {
          setAiError(data.error || "Failed to analyze tags");
        }
      } catch {
        if (!cancelled) setAiError("Failed to analyze tags");
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [caseData.story, timelineEvents]);

  // Track donation CTA shown
  useEffect(() => {
    if (submitted && typeof window !== "undefined" && window.umami) {
      window.umami.track("donation_cta_shown", { source: "filing_wizard" });
    }
  }, [submitted]);

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagName)) {
        next.delete(tagName);
      } else {
        next.add(tagName);
      }
      return next;
    });
  };

  async function handleSendCode() {
    setVerifyError("");
    if (!verifyEmail) {
      setVerifyError("Please enter your email address.");
      return;
    }
    setVerifyLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error || "Failed to send code.");
        return;
      }
      setVerifyStep("sent");
    } catch {
      setVerifyError("Network error. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleVerifyCode() {
    setVerifyError("");
    if (verifyCode.length !== 6) {
      setVerifyError("Please enter the 6-digit code.");
      return;
    }
    setVerifyLoading(true);
    try {
      const result = await signIn("credentials", {
        email: verifyEmail,
        code: verifyCode,
        redirect: false,
      });
      if (result?.error) {
        setVerifyError("Invalid or expired code. Please try again.");
        return;
      }
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const id = session?.user?.id ?? "";
      setLocalWorkerId(id);
      setLocalEmail(verifyEmail);
      setVerifyStep("verified");
    } catch {
      setVerifyError("Verification failed. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  }

  const workPeriod =
    caseData.workDateStart && caseData.workDateEnd
      ? `${format(caseData.workDateStart, "MMM yyyy")} – ${format(caseData.workDateEnd, "MMM yyyy")}`
      : caseData.workDateStart
      ? `From ${format(caseData.workDateStart, "MMM yyyy")}`
      : "";

  const currencySymbol = CURRENCY_SYMBOLS[caseData.currency] || caseData.currency;

  async function handleSubmit() {
    setSubmitError("");
    setLoading(true);

    try {
      let token = turnstileToken;
      if (!token && turnstileRef.current) {
        turnstileRef.current.execute();
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
        currency: caseData.currency || "USD",
        story: caseData.story,
        email: resolvedEmail,
        optInSolicitor: caseData.optInSolicitor,
        optInCollective: caseData.optInCollective,
        optInCompanyNotify: caseData.optInCompanyNotify,
        optInCompanyContact: caseData.optInCompanyContact,
        attested: true as const,
        timelineEvents: timelineEvents.map((ev) => ({
          eventType: ev.eventType,
          eventDate: ev.eventDate.toISOString(),
          description: ev.description,
          responseReceived: ev.responseReceived,
        })),
        selectedTags: Array.from(selectedTags),
        aiTags: aiTags,
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
    } catch {
      setSubmitError("Network error. Please try again.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setLoading(false);
    }
  }

  async function handleDonateSubmit() {
    setDonateError(null);
    setDonateLoading(true);
    window.umami?.track("donation_cta_donate_clicked", { amount_eur: String(donateAmountEur) });
    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amountCents: donateAmountEur * 100,
          locale,
          returnTo: `/${locale}/cases`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || t("fileCase.donation.errorGeneric"));
      }
      setDonateClientSecret(json.data.clientSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("fileCase.donation.errorGeneric");
      setDonateError(message);
    } finally {
      setDonateLoading(false);
    }
  }

  const DONATE_AMOUNTS = [5, 10, 25, 50, 100] as const;

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-8 text-center">
          <div className="w-12 h-12 bg-sindicato-warm-white/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-sindicato-warm-white" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-2">
            Case filed
          </h2>
          <p className="text-sindicato-warm-white/60 text-sm mb-1">
            Your case has been recorded.
          </p>
          {caseId && (
            <p className="text-xs text-sindicato-warm-white/40 font-mono">
              #{caseId.slice(-8).toUpperCase()}
            </p>
          )}

          {/* Donation CTA */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <AnimatePresence mode="wait">
              {!donateClientSecret ? (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-2">
                    {t("fileCase.donation.title")}
                  </h3>
                  <p className="text-sindicato-warm-white/50 text-sm mb-6 max-w-sm mx-auto">
                    {t("fileCase.donation.body")}
                  </p>

                  <div className="flex justify-center gap-2 mb-6">
                    {DONATE_AMOUNTS.map((amount) => {
                      const active = donateAmountEur === amount;
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setDonateAmountEur(amount)}
                          className={`w-14 h-10 text-sm font-bold font-[family-name:var(--font-barlow)] border transition-colors ${
                            active
                              ? "bg-sindicato-warm-white text-sindicato-bordeaux border-sindicato-warm-white"
                              : "bg-transparent text-sindicato-warm-white border-white/15 hover:border-white/40"
                          }`}
                          aria-pressed={active}
                        >
                          {amount}€
                        </button>
                      );
                    })}
                  </div>

                  {donateError && (
                    <p className="text-red-300/90 text-sm mb-4" role="alert">
                      {donateError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleDonateSubmit}
                    disabled={donateLoading || !stripePublishableKey}
                    className="w-full h-12 bg-sindicato-warm-white text-sindicato-bordeaux font-[family-name:var(--font-barlow)] font-bold uppercase tracking-wider text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {donateLoading ? t("fileCase.donation.processing") : t("fileCase.donation.donate")}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.umami?.track("donation_cta_skipped", {});
                      router.push(`/${locale}/cases`);
                    }}
                    className="text-sindicato-warm-white/40 hover:text-sindicato-warm-white/70 text-xs uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] font-bold"
                  >
                    {t("fileCase.donation.skip")} →
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="checkout"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{
                      clientSecret: donateClientSecret,
                      onComplete: () => {
                        // Payment completed — Stripe will redirect to return_url
                      },
                    }}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                  {checkoutError && (
                    <p className="text-amber-300/90 text-sm mt-3 text-center" role="alert">
                      {checkoutError}
                    </p>
                  )}
                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setDonateClientSecret(null);
                        setDonateError(null);
                        setCheckoutError(null);
                      }}
                      className="text-sindicato-warm-white/50 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] font-bold"
                    >
                      {t("fileCase.donation.back")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-1">
          Review your case
        </h2>
        <p className="text-sindicato-warm-white/60 text-sm mb-8">
          Please review the details below before submitting.
        </p>

        <div className="bg-white/5 border border-white/10 p-4 sm:p-6 mb-6">
          <SummaryRow label="Email" value={resolvedEmail} />
          <SummaryRow
            label={t("review.labelPlatform")}
            value={caseData.vertical === "remote" ? t("review.platformRemote") : caseData.vertical === "gig" ? t("review.platformGig") : caseData.vertical || ""}
          />
          <SummaryRow label="Company" value={caseData.companyName} />
          <SummaryRow label="Case type" value={CASE_TYPE_LABELS[caseData.caseType] || caseData.caseType} />
          <SummaryRow label="Your name" value={caseData.displayName} />
          <SummaryRow label="Country" value={caseData.country} />
          <SummaryRow label="Work period" value={workPeriod} />
          {caseData.amountOwed && (
            <SummaryRow label="Amount owed" value={`${currencySymbol}${caseData.amountOwed} ${caseData.currency}`} />
          )}
          {contactAttemptsFromTimeline > 0 && (
            <SummaryRow label="Contact attempts" value={String(contactAttemptsFromTimeline)} />
          )}
          {caseData.project && (
            <SummaryRow label="Project" value={caseData.project} />
          )}
          {caseData.story && (
            <div className="py-3 border-b border-white/10 last:border-0">
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
                  <span className="text-sindicato-warm-white/50 shrink-0">
                    {format(ev.eventDate, "d MMM yyyy")}
                  </span>
                  <span className="text-sindicato-warm-white/70 line-clamp-1">{ev.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tag Selection */}
        <div className="mb-6">
          <p className={`${rowLabelClass} mb-1`}>{t("fileCase.tagsTitle")}</p>
          <p className="text-xs text-sindicato-warm-white/40 mb-4">
            {t("fileCase.tagsDescription")}
          </p>

          {/* AI-detected tags */}
          {(aiLoading || aiTags.length > 0 || aiError) && (
            <div className="mb-4 p-3 bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-wider font-bold text-sindicato-warm-white/40 mb-2">
                {t("tags.source.ai")}
              </p>
              {aiLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/20 border-t-sindicato-warm-white/60 rounded-full animate-spin" />
                  <span className="text-[10px] text-sindicato-warm-white/40">
                    {t("tags.generatingTags")}
                  </span>
                </div>
              )}
              {!aiLoading && aiError && (
                <p className="text-[10px] text-amber-400/60">{aiError}</p>
              )}
              {!aiLoading && aiTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {aiTags.map((tag) => {
                    const def = TAG_TAXONOMY[tag.category as keyof typeof TAG_TAXONOMY]?.tags.find(
                      (t) => t.name === tag.tagName
                    );
                    const severity = def?.severity ?? "yellow";
                    const i18nKey = def?.i18nKey;
                    return (
                      <span
                        key={tag.tagName}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${SEVERITY_COLORS[severity].bg} ${SEVERITY_COLORS[severity].text} ${SEVERITY_COLORS[severity].border}`}
                        title={`${tag.confidence}% — ${tag.sourceText}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT_COLORS[severity]}`} />
                        {i18nKey ? t(i18nKey) : tag.tagName}
                        <span className="text-[8px] opacity-50">{tag.confidence}%</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {TAG_CATEGORIES.filter((cat) => cat !== "company_positive").map((catSlug) => {
              const cat = TAG_TAXONOMY[catSlug];
              return (
                <div key={catSlug}>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-sindicato-warm-white/30 mb-2">
                    {t(cat.i18nKey)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.tags.map((tag) => {
                      const isSelected = selectedTags.has(tag.name);
                      const isAuto = autoSelectedTags.includes(tag.name);
                      return (
                        <button
                          key={tag.name}
                          type="button"
                          onClick={() => toggleTag(tag.name)}
                          className={`
                            inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 border transition-colors
                            ${isSelected
                              ? "bg-white/15 border-white/30 text-sindicato-warm-white"
                              : "bg-white/5 border-white/10 text-sindicato-warm-white/40 hover:border-white/20 hover:text-sindicato-warm-white/60"
                            }
                          `}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT_COLORS[tag.severity]}`} />
                          {t(tag.i18nKey)}
                          {isAuto && (
                            <span className="text-[8px] text-amber-400/60 ml-0.5">
                              ({t("fileCase.tagsAutoLabel")})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-sindicato-warm-white/30 mt-3">
            {t("fileCase.tagsAutoExplanation")}
          </p>
        </div>

        {/* Email verification for unauthenticated users */}
        {!hasSession && verifyStep !== "verified" && (
          <div className="border border-sindicato-warm-white/20 bg-white/5 p-4 sm:p-6 mb-6">
            <h3 className="text-sm font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-1">
              Verify your email
            </h3>
            <p className="text-xs text-sindicato-warm-white/60 mb-4">
              One last step — we&apos;ll send a code to confirm your identity before submitting.
            </p>

            {verifyStep === "idle" && (
              <div className="space-y-3">
                <input
                  type="email"
                  value={verifyEmail}
                  onChange={(e) => setVerifyEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white p-3 text-sm focus:border-sindicato-warm-white/50 focus:outline-none focus:ring-0 placeholder:text-sindicato-warm-white/30"
                />
                {verifyError && <p className="text-xs text-red-400">{verifyError}</p>}
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={verifyLoading || !verifyEmail}
                  className="bg-sindicato-charcoal text-sindicato-warm-white px-5 py-2 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)] hover:bg-sindicato-charcoal/80 transition-colors disabled:opacity-50"
                >
                  {verifyLoading ? "Sending..." : "Send Code"}
                </button>
              </div>
            )}

            {verifyStep === "sent" && (
              <div className="space-y-3">
                <p className="text-xs text-sindicato-warm-white/70">
                  We sent a 6-digit code to <span className="font-bold">{verifyEmail}</span>
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white p-3 text-center font-mono text-xl tracking-[0.5em] focus:border-sindicato-warm-white/50 focus:outline-none focus:ring-0 placeholder:text-sindicato-warm-white/30"
                />
                {verifyError && <p className="text-xs text-red-400">{verifyError}</p>}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifyLoading || verifyCode.length !== 6}
                    className="bg-sindicato-charcoal text-sindicato-warm-white px-5 py-2 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)] hover:bg-sindicato-charcoal/80 transition-colors disabled:opacity-50"
                  >
                    {verifyLoading ? "Verifying..." : "Verify"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setVerifyStep("idle"); setVerifyCode(""); setVerifyError(""); }}
                    className="text-sindicato-warm-white/50 hover:text-sindicato-warm-white text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)]"
                  >
                    Change email
                  </button>
                </div>
              </div>
            )}
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
          <p className="text-xs text-red-400 mb-4">{submitError}</p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !resolvedWorkerId}
            className="w-full bg-sindicato-charcoal text-sindicato-warm-white py-3 px-6 font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-colors font-[family-name:var(--font-barlow)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Case"}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="text-sindicato-warm-white/60 hover:text-sindicato-warm-white transition-colors text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold"
            >
              Back
            </button>
          </div>
        </div>

        <p className="text-xs text-sindicato-warm-white/40 text-center mt-4">
          By submitting, you confirm your case details are accurate and truthful.
        </p>
      </div>
    </motion.div>
  );
}
