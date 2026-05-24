"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CircleHelpIcon } from "lucide-react";
import CompanyCombobox from "./CompanyCombobox";
import CountryCombobox from "./CountryCombobox";
import WorkDatePicker from "./WorkDatePicker";
import PlatformCombobox from "./PlatformCombobox";
import type { CaseFormData } from "../FilingWizard";
import { fileDropdownContentClass, fileSelectItemClass } from "../fileFormStyles";

const CASE_TYPES = [
  { value: "unpaid_wages", label: "Unpaid Wages" },
  { value: "late_payment", label: "Late Payment" },
  { value: "sudden_deactivation", label: "Sudden Deactivation" },
  { value: "unfair_review", label: "Unfair Performance Review" },
  { value: "predatory_practices", label: "Predatory Practices" },
  { value: "harassment", label: "Harassment" },
  { value: "retaliation", label: "Retaliation" },
  { value: "contract_violation", label: "Contract Violation" },
  { value: "data_privacy", label: "Data / Privacy Issue" },
  { value: "other", label: "Other" },
];

const NO_AMOUNT_TYPES = new Set([
  "harassment",
  "retaliation",
  "predatory_practices",
  "data_privacy",
  "unfair_review",
]);

const AGE_RANGES = [
  { value: "prefer_not", label: "Prefer not to say" },
  { value: "18-24", label: "18–24" },
  { value: "25-34", label: "25–34" },
  { value: "35-44", label: "35–44" },
  { value: "45+", label: "45+" },
];

const CURRENCIES = [
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "\u20ac EUR" },
  { value: "GBP", label: "\u00a3 GBP" },
  { value: "BRL", label: "R$ BRL" },
  { value: "INR", label: "\u20b9 INR" },
  { value: "CAD", label: "C$ CAD" },
  { value: "AUD", label: "A$ AUD" },
  { value: "JPY", label: "\u00a5 JPY" },
];

const getCaseTypeLabel = (value: string) => {
  const ct = CASE_TYPES.find((t) => t.value === value);
  return ct ? ct.label : "Select case type...";
};

interface CaseDetailsStepProps {
  caseData: CaseFormData;
  setCaseData: React.Dispatch<React.SetStateAction<CaseFormData>>;
  onNext: () => void;
}

function FieldTooltip({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger type="button" onClick={() => setOpen(!open)} className="inline-flex items-center justify-center ml-1.5 -translate-y-px cursor-help">
        <CircleHelpIcon className="w-3.5 h-3.5 text-sindicato-warm-white/40 hover:text-sindicato-warm-white/70 transition-colors" />
      </TooltipTrigger>
      <TooltipContent side="top" align="start" sideOffset={6} className="max-w-xs text-xs leading-relaxed p-3 bg-sindicato-charcoal text-sindicato-warm-white border border-white/10">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export default function CaseDetailsStep({
  caseData,
  setCaseData,
  onNext,
}: CaseDetailsStepProps) {
  const wordCount = caseData.story.trim()
    ? caseData.story.trim().split(/\s+/).length
    : 0;

  const showAmountField = !NO_AMOUNT_TYPES.has(caseData.caseType);

  function update<K extends keyof CaseFormData>(key: K, value: CaseFormData[K]) {
    setCaseData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  const labelClass =
    "flex items-center text-sindicato-warm-white/70 mb-2 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold";
  const inputClass =
    "w-full bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white p-3 focus:border-sindicato-warm-white/50 focus:outline-none focus:ring-0 transition-colors text-sm placeholder:text-sindicato-warm-white/30";
  const selectTriggerClass =
    "w-full bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white h-auto py-3 px-3 focus:border-sindicato-warm-white/50 focus:ring-0 text-sm [&_svg]:text-sindicato-warm-white/40";
  const primaryBtnClass =
    "w-full bg-sindicato-charcoal text-sindicato-warm-white py-3 px-6 font-bold uppercase tracking-wider hover:bg-sindicato-charcoal/80 transition-colors font-[family-name:var(--font-barlow)]";
  const checkboxLabelClass =
    "flex items-start gap-3 cursor-pointer group text-sm text-sindicato-warm-white/70";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-1">
          Your Case
        </h2>
        <p className="text-sindicato-warm-white/60 text-sm mb-8">
          Tell us what happened. All fields marked * are required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform type */}
          <div>
            <label className={labelClass}>
              Platform type *
              <FieldTooltip content="Select the type of platform you work through. Remote platforms involve online freelance or contract work you do from a computer. Gig platforms involve location-based services like delivery, rideshare, or local tasks. If your platform type isn't listed, type it in and press Enter to add it." />
            </label>
            <PlatformCombobox
              value={caseData.vertical}
              onChange={(slug) => update("vertical", slug)}
            />
          </div>

          {/* Company */}
          <div>
            <label className={labelClass}>
              Company *
              <FieldTooltip content="Search for your company by name. If it doesn't appear, type the name and press Enter to add it. Your identity stays protected regardless of whether the company is already listed. All personal details are anonymized on the public case wall." />
            </label>
            <CompanyCombobox
              value={caseData.companySlug}
              displayName={caseData.companyName}
              onChange={(slug, name) => {
                update("companySlug", slug);
                update("companyName", name);
              }}
            />
          </div>

          {/* Case type */}
          <div>
            <label className={labelClass}>
              Case type *
              <FieldTooltip content="Select the category that best describes your issue. This helps organize cases and identify patterns across companies. If none fits perfectly, choose the closest match." />
            </label>
            <Select
              value={caseData.caseType}
              onValueChange={(val) => update("caseType", val ?? "")}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue>{getCaseTypeLabel(caseData.caseType)}</SelectValue>
              </SelectTrigger>
              <SelectContent className={fileDropdownContentClass}>
                {CASE_TYPES.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value} className={fileSelectItemClass}>
                    {ct.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display name */}
          <div>
            <label htmlFor="displayName" className={labelClass}>
              Your name *
              <FieldTooltip content="This name will appear on the public case wall partially redacted (e.g. 'V*****'). You can use your real name or a pseudonym. Lawyers and companies can only contact you through our anonymous alias system — your identity stays protected until you explicitly choose to share it. All contact through the platform is logged on your case timeline, and you are notified of every request." />
            </label>
            <input
              id="displayName"
              type="text"
              value={caseData.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              placeholder="First name or pseudonym"
              className={inputClass}
              required
            />
          </div>

          {/* Country */}
          <div>
            <label className={labelClass}>
              Country *
              <FieldTooltip content="Your country helps identify regional patterns and lets us connect you with relevant legal resources. Only the country name is shown publicly on your case. Your exact location is never shared." />
            </label>
            <CountryCombobox
              value={caseData.country}
              onChange={(code) => update("country", code)}
            />
          </div>

          {/* Work period */}
          <div>
            <label className={labelClass}>
              Work period *
              <FieldTooltip content="Select the date range when you did work for this company. Click the first date, then the second — the range will be highlighted. This helps establish a timeline for your case." />
            </label>
            <WorkDatePicker
              from={caseData.workDateStart}
              to={caseData.workDateEnd}
              onChange={({ from, to }) => {
                update("workDateStart", from);
                update("workDateEnd", to);
              }}
            />
          </div>

          {/* Amount owed */}
          {showAmountField && (
            <div>
              <label htmlFor="amountOwed" className={labelClass}>
                Amount owed
                <FieldTooltip content="Enter the total amount of money owed to you. Select the currency from the dropdown — we support USD, EUR, GBP, BRL, INR, CAD, AUD, JPY, and more." />
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="amountOwed"
                    type="text"
                    inputMode="decimal"
                    value={caseData.amountOwed}
                    onChange={(e) => update("amountOwed", e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white h-auto py-3 px-3 focus:border-sindicato-warm-white/50 focus:ring-0 text-sm placeholder:text-sindicato-warm-white/30"
                  />
                </div>
                <Select
                  value={caseData.currency}
                  onValueChange={(val) => update("currency", val ?? "USD")}
                >
                  <SelectTrigger className="w-28 bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white h-auto py-3 px-3 focus:border-sindicato-warm-white/50 focus:ring-0 text-sm shrink-0 [&_svg]:text-sindicato-warm-white/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={fileDropdownContentClass}>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value} className={fileSelectItemClass}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Story */}
          <div>
            <label htmlFor="story" className={labelClass}>
              What happened *{" "}
              <span className="font-normal normal-case tracking-normal ml-1 text-sindicato-warm-white/40">
                (100–500 words)
              </span>
              <FieldTooltip content="Describe what happened in as much detail as possible — when it started, who you contacted, what responses you received. This is the most important part of your case and will be visible publicly on the Cases Wall. (100–500 words)" />
            </label>
            <textarea
              id="story"
              value={caseData.story}
              onChange={(e) => update("story", e.target.value)}
              placeholder="Describe what happened in as much detail as you can..."
              rows={8}
              className={`${inputClass} resize-y min-h-[12rem]`}
              required
            />
            <p
              className={`text-xs mt-1 text-right ${
                wordCount < 100 || wordCount > 500
                  ? "text-sindicato-warm-white/40"
                  : "text-green-400"
              }`}
            >
              {wordCount} / 500 words
              {wordCount < 100 && wordCount > 0 && (
                <span className="ml-1">(min. 100)</span>
              )}
            </p>
          </div>

          {/* Age range */}
          <div>
            <label className={labelClass}>
              Age range (optional)
              <FieldTooltip content="Optional. Your age range helps us identify demographic patterns in workplace issues across platforms. This data is used only for aggregate analysis." />
            </label>
            <Select
              value={caseData.ageRange}
              onValueChange={(val) => update("ageRange", val ?? "")}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Prefer not to say" />
              </SelectTrigger>
              <SelectContent className={fileDropdownContentClass}>
                {AGE_RANGES.map((ar) => (
                  <SelectItem key={ar.value} value={ar.value} className={fileSelectItemClass}>
                    {ar.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project name (remote only) */}
          {caseData.vertical === "remote" && (
            <div>
              <label htmlFor="project" className={labelClass}>
                Project name (optional)
                <FieldTooltip content="The specific project, task, or contract you were working on. This helps identify patterns within specific projects at the same company." />
              </label>
              <input
                id="project"
                type="text"
                value={caseData.project}
                onChange={(e) => update("project", e.target.value)}
                placeholder="e.g. Claude Code Review"
                className={inputClass}
              />
            </div>
          )}

          {/* Consent checkboxes */}
          <div className="border-t border-white/10 pt-6 space-y-4">
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={caseData.optInSolicitor}
                onChange={(e) => update("optInSolicitor", e.target.checked)}
                className="mt-0.5 accent-sindicato-warm-white"
              />
              <span>
                I&apos;m open to being contacted by a labor lawyer about my case.
                <FieldTooltip content="If checked, labor lawyers can view your case and reach out through our anonymized system. Your identity remains protected unless you choose to share it. All contact through the platform is logged on your case timeline, and you'll be notified of every request." />
              </span>
            </label>
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={caseData.optInCollective}
                onChange={(e) => update("optInCollective", e.target.checked)}
                className="mt-0.5 accent-sindicato-warm-white"
              />
              <span>
                I&apos;d like to join a collective action if others with the same company come forward.
                <FieldTooltip content="If checked, you'll be notified when other workers file cases against the same company. You can then choose whether to participate in collective action or legal proceedings." />
              </span>
            </label>
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={caseData.optInCompanyNotify}
                onChange={(e) => update("optInCompanyNotify", e.target.checked)}
                className="mt-0.5 accent-sindicato-warm-white"
              />
              <span>
                I consent to Sindicato notifying the company on my behalf.
                <FieldTooltip content="Sindicato will notify the company that a case has been filed. Companies can read your case but cannot see your real name or email unless you choose to share it. You will be notified immediately each time your case is viewed." />
              </span>
            </label>
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={caseData.optInCompanyContact}
                onChange={(e) => update("optInCompanyContact", e.target.checked)}
                className="mt-0.5 accent-sindicato-warm-white"
              />
              <span>
                I&apos;m open to being contacted by the company through the platform to help resolve this issue. I understand my identity stays anonymized unless I choose to share it.
                <FieldTooltip content="If checked, the company can reach you through our anonymized alias system. Your real identity is never shared without your explicit consent. All communications are logged on your case timeline and you will be notified of every contact request." />
              </span>
            </label>

            <div className="border-t border-white/10 pt-4">
              <label className={`${checkboxLabelClass} font-semibold`}>
                <input
                  type="checkbox"
                  checked={caseData.attested}
                  onChange={(e) => update("attested", e.target.checked)}
                  className="mt-0.5 accent-sindicato-warm-white"
                  required
                />
                <span className="text-sindicato-warm-white/90">
                  I attest that the information I have provided is accurate and truthful to the best of my knowledge. *
                  <FieldTooltip content="You must confirm that all information you've provided is accurate and truthful. This is a legal attestation required before your case can be submitted." />
                </span>
              </label>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              className={primaryBtnClass}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
