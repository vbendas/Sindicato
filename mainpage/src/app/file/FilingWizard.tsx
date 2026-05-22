"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Header from "@/app/components/Header";
import StepIndicator from "./components/StepIndicator";
import EmailVerifyStep from "./components/EmailVerifyStep";
import CaseDetailsStep from "./components/CaseDetailsStep";
import TimelineStep from "./components/TimelineStep";
import ReviewStep from "./components/ReviewStep";

export type Step = "verify" | "details" | "timeline" | "review";

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
  contactAttempts: string;
  story: string;
  ageRange: string;
  sex: string;
  project: string;
  optInSolicitor: boolean;
  optInCollective: boolean;
  optInCompanyNotify: boolean;
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

  const [step, setStep] = useState<Step>("verify");
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
    contactAttempts: "",
    story: "",
    ageRange: "",
    sex: "",
    project: "",
    optInSolicitor: false,
    optInCollective: false,
    optInCompanyNotify: true,
    attested: false,
  });

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);


  return (
    <div className="min-h-screen bg-sindicato-charcoal">
      <div className="fixed inset-0 pointer-events-none z-50 grain-overlay" style={{ opacity: 0.45 }} />
      <Header
        scrolledBg="bg-sindicato-charcoal/80 backdrop-blur-md border-white/10"
        clerkBg="bg-sindicato-bordeaux text-sindicato-cream"
      />
      <div className="relative z-10 pt-24 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
        <StepIndicator currentStep={step} />
        <AnimatePresence mode="wait">
          {step === "verify" && (
            <EmailVerifyStep
              key="verify"
              onSuccess={(email, id) => {
                setVerifiedEmail(email);
                setWorkerId(id);
                setStep("details");
              }}
            />
          )}
          {step === "details" && (
            <CaseDetailsStep
              key="details"
              email={verifiedEmail}
              caseData={caseData}
              setCaseData={setCaseData}
              onBack={() => setStep("verify")}
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
      </div>
    </div>
  );
}
