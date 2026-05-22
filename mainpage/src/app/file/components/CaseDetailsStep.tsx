"use client";

import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CompanyCombobox from "./CompanyCombobox";
import CountryCombobox from "./CountryCombobox";
import WorkDatePicker from "./WorkDatePicker";
import type { CaseFormData } from "../FilingWizard";

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

interface CaseDetailsStepProps {
  email: string;
  caseData: CaseFormData;
  setCaseData: React.Dispatch<React.SetStateAction<CaseFormData>>;
  onBack: () => void;
  onNext: () => void;
}

export default function CaseDetailsStep({
  caseData,
  setCaseData,
  onBack,
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
    "block text-sindicato-charcoal/70 mb-2 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold";
  const inputClass =
    "w-full bg-white border border-sindicato-charcoal/20 rounded-none text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none focus:ring-0 transition-colors text-sm";
  const primaryBtnClass =
    "w-full bg-sindicato-bordeaux text-sindicato-cream py-3 px-6 font-bold uppercase tracking-wider hover:bg-sindicato-bordeaux-dark transition-colors font-[family-name:var(--font-barlow)]";
  const secondaryBtnClass =
    "text-sindicato-charcoal/60 hover:text-sindicato-charcoal transition-colors text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold";
  const checkboxLabelClass =
    "flex items-start gap-3 cursor-pointer group text-sm text-sindicato-charcoal/70";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white border border-sindicato-charcoal/10 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-sindicato-charcoal font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-1">
          Your Case
        </h2>
        <p className="text-sindicato-charcoal/60 text-sm mb-8">
          Tell us what happened. All fields marked * are required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vertical toggle */}
          <div>
            <label className={labelClass}>Platform type *</label>
            <div className="flex gap-2">
              {[
                { value: "remote", label: "Remote Platform" },
                { value: "gig", label: "Gig Delivery" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("vertical", opt.value)}
                  className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)] border transition-colors ${
                    caseData.vertical === opt.value
                      ? "bg-sindicato-bordeaux text-sindicato-cream border-sindicato-bordeaux"
                      : "bg-white text-sindicato-charcoal/60 border-sindicato-charcoal/20 hover:border-sindicato-charcoal/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <label className={labelClass}>Company *</label>
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
            <label className={labelClass}>Case type *</label>
            <Select
              value={caseData.caseType}
              onValueChange={(val) => update("caseType", val ?? "")}
            >
              <SelectTrigger className="w-full bg-white border border-sindicato-charcoal/20 rounded-none text-sindicato-charcoal h-auto py-3 px-3 focus:border-sindicato-bordeaux focus:ring-0 text-sm">
                <SelectValue placeholder="Select case type..." />
              </SelectTrigger>
              <SelectContent>
                {CASE_TYPES.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value}>
                    {ct.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display name */}
          <div>
            <label htmlFor="displayName" className={labelClass}>
              Your name / pseudonym *
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
            <label className={labelClass}>Country *</label>
            <CountryCombobox
              value={caseData.country}
              onChange={(code) => update("country", code)}
            />
          </div>

          {/* Work period */}
          <div>
            <label className={labelClass}>Work period *</label>
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
                Amount owed (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sindicato-charcoal/40 text-sm font-medium">
                  $
                </span>
                <input
                  id="amountOwed"
                  type="text"
                  inputMode="decimal"
                  value={caseData.amountOwed}
                  onChange={(e) => update("amountOwed", e.target.value)}
                  placeholder="0.00"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
          )}

          {/* Contact attempts */}
          <div>
            <label htmlFor="contactAttempts" className={labelClass}>
              Number of contact attempts *
            </label>
            <input
              id="contactAttempts"
              type="number"
              min="0"
              value={caseData.contactAttempts}
              onChange={(e) => update("contactAttempts", e.target.value)}
              placeholder="0"
              className={inputClass}
              required
            />
          </div>

          {/* Story */}
          <div>
            <label htmlFor="story" className={labelClass}>
              What happened *{" "}
              <span className="font-normal normal-case tracking-normal ml-1 text-sindicato-charcoal/40">
                (100–500 words)
              </span>
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
                  ? "text-sindicato-charcoal/40"
                  : "text-green-600"
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
            <label className={labelClass}>Age range (optional)</label>
            <Select
              value={caseData.ageRange}
              onValueChange={(val) => update("ageRange", val ?? "")}
            >
              <SelectTrigger className="w-full bg-white border border-sindicato-charcoal/20 rounded-none text-sindicato-charcoal h-auto py-3 px-3 focus:border-sindicato-bordeaux focus:ring-0 text-sm">
                <SelectValue placeholder="Prefer not to say" />
              </SelectTrigger>
              <SelectContent>
                {AGE_RANGES.map((ar) => (
                  <SelectItem key={ar.value} value={ar.value}>
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
          <div className="border-t border-sindicato-charcoal/10 pt-6 space-y-4">
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={caseData.optInSolicitor}
                onChange={(e) => update("optInSolicitor", e.target.checked)}
                className="mt-0.5 accent-sindicato-bordeaux"
              />
              <span>
                I&apos;m open to being contacted by a labor lawyer about my case.
              </span>
            </label>
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={caseData.optInCollective}
                onChange={(e) => update("optInCollective", e.target.checked)}
                className="mt-0.5 accent-sindicato-bordeaux"
              />
              <span>
                I&apos;d like to join a collective action if others with the same company come forward.
              </span>
            </label>
            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={caseData.optInCompanyNotify}
                onChange={(e) => update("optInCompanyNotify", e.target.checked)}
                className="mt-0.5 accent-sindicato-bordeaux"
              />
              <span>
                I consent to Sindicato notifying the company on my behalf.
              </span>
            </label>

            <div className="border-t border-sindicato-charcoal/10 pt-4">
              <label className={`${checkboxLabelClass} font-semibold`}>
                <input
                  type="checkbox"
                  checked={caseData.attested}
                  onChange={(e) => update("attested", e.target.checked)}
                  className="mt-0.5 accent-sindicato-bordeaux"
                  required
                />
                <span className="text-sindicato-charcoal/90">
                  I attest that the information I have provided is accurate and truthful to the best of my knowledge. *
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
            <div className="text-center">
              <button type="button" onClick={onBack} className={secondaryBtnClass}>
                Back
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
