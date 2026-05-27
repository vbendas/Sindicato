"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/app/components/Header";
import StepIndicator from "./components/StepIndicator";
import CaseDetailsStep from "./components/CaseDetailsStep";
import TimelineStep from "./components/TimelineStep";
import ReviewStep from "./components/ReviewStep";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useT } from "@/lib/i18n";

export type Step = "details" | "timeline" | "review";

export interface CaseFormData {
  vertical: string;
  companySlug: string;
  companyName: string;
  caseType: string;
  displayName: string;
  country: string;
  workDateStart: Date | undefined;
  workDateEnd: Date | undefined;
  amountOwed: string;
  currency: string;
  story: string;
  ageRange: string;
  sex: string;
  project: string;
  optInSolicitor: boolean;
  optInCollective: boolean;
  optInCompanyNotify: boolean;
  optInCompanyContact: boolean;
  attested: boolean;
}

export interface TimelineEvent {
  id: string;
  eventType: string;
  eventDate: Date;
  description: string;
  responseReceived: boolean;
}

export default function FilingWizard() {
  const searchParams = useSearchParams();
  const t = useT();

  const [step, setStep] = useState<Step>("details");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [workerId, setWorkerId] = useState("");

  const [caseData, setCaseData] = useState<CaseFormData>({
    vertical: "",
    companySlug: searchParams.get("company") || "",
    companyName: "",
    caseType: "",
    displayName: "",
    country: "",
    workDateStart: undefined,
    workDateEnd: undefined,
    amountOwed: "",
    currency: "USD",
    story: "",
    ageRange: "",
    sex: "",
    project: "",
    optInSolicitor: true,
    optInCollective: true,
    optInCompanyNotify: true,
    optInCompanyContact: true,
    attested: false,
  });

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (s?.user) {
          setVerifiedEmail(s.user.email ?? "");
          setWorkerId(s.user.id ?? "");
        }
      })
      .catch(() => {});
  }, []);


  return (
    <div className="min-h-screen bg-sindicato-charcoal">
      <div className="fixed inset-0 pointer-events-none z-50 grain-overlay" style={{ opacity: 0.45 }} />
      <Header
        scrolledBg="bg-sindicato-charcoal/80 backdrop-blur-md border-white/10"
        clerkBg="bg-sindicato-bordeaux text-sindicato-warm-white"
      />
      <div className="relative z-10 pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-12 h-0.5 bg-white/20 mb-6 mx-auto" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-warm-white uppercase font-[family-name:var(--font-barlow)] tracking-tight mb-2">
            {t("fileCase.title")}
          </h1>
          <p className="text-sindicato-warm-white/40 text-sm font-[family-name:var(--font-jetbrains)]">
            {t("fileCase.subtitle")}
          </p>
        </motion.div>

        <StepIndicator currentStep={step} />
        <TooltipProvider delay={400}>
          <AnimatePresence mode="wait">
          {step === "details" && (
            <CaseDetailsStep
              key="details"
              caseData={caseData}
              setCaseData={setCaseData}
              onNext={() => setStep("timeline")}
            />
          )}
          {step === "timeline" && (
            <TimelineStep
              key="timeline"
              caseData={caseData}
              events={timelineEvents}
              setEvents={setTimelineEvents}
              onBack={() => setStep("details")}
              onNext={() => setStep("review")}
            />
          )}
          {step === "review" && (
            <ReviewStep
              key="review"
              email={verifiedEmail}
              workerId={workerId}
              caseData={caseData}
              timelineEvents={timelineEvents}
              onBack={() => setStep("timeline")}
            />
          )}
        </AnimatePresence>
        </TooltipProvider>
      </div>
    </div>
  );
}
