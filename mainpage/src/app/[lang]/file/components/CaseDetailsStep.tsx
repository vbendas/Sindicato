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
import { StoryTips } from "@/components/cases/StoryTips";
import type { CaseFormData } from "../FilingWizard";
import { fileDropdownContentClass, fileSelectItemClass } from "../fileFormStyles";
import { useT } from "@/lib/i18n";
import { getTemplateForCaseType } from "@/lib/case-templates";

const CASE_TYPES = [
  { value: "unpaid_wages" },
  { value: "late_payment" },
  { value: "sudden_deactivation" },
  { value: "unfair_review" },
  { value: "predatory_practices" },
  { value: "harassment" },
  { value: "retaliation" },
  { value: "contract_violation" },
  { value: "data_privacy" },
  { value: "other" },
];

const NO_AMOUNT_TYPES = new Set([
  "harassment",
  "retaliation",
  "predatory_practices",
  "data_privacy",
  "unfair_review",
]);

const AGE_RANGES = [
  { value: "prefer_not" },
  { value: "18-24" },
  { value: "25-34" },
  { value: "35-44" },
  { value: "45+" },
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
  const t = useT();
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
          {t("fileCase.yourCase")}
        </h2>
        <p className="text-sindicato-warm-white/60 text-sm mb-8">
          {t("fileCase.tellUsWhatHappened")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform type */}
          <div>
            <label className={labelClass}>
              {t("fileCase.platformType")} *
              <FieldTooltip content={t("fileCase.platformTypeTooltip")} />
            </label>
            <PlatformCombobox
              value={caseData.vertical}
              onChange={(slug) => update("vertical", slug)}
            />
          </div>

          {/* Company */}
          <div>
            <label className={labelClass}>
              {t("fileCase.company")} *
              <FieldTooltip content={t("fileCase.companyTooltip")} />
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

          {/* Company website (optional) */}
          <div>
            <label htmlFor="companyWebsite" className={labelClass}>
              {t("fileCase.companyWebsite")}
              <FieldTooltip content={t("fileCase.companyWebsiteTooltip")} />
            </label>
            <input
              id="companyWebsite"
              type="url"
              value={caseData.companyWebsite}
              onChange={(e) => update("companyWebsite", e.target.value)}
              placeholder="https://www.example.com"
              className={inputClass}
            />
            <p className="text-xs mt-1 text-sindicato-warm-white/40">
              {t("fileCase.companyWebsiteHint")}
            </p>
          </div>

          {/* Case type */}
          <div>
            <label className={labelClass}>
              {t("fileCase.caseType")} *
              <FieldTooltip content={t("fileCase.caseTypeTooltip")} />
            </label>
            <Select
              value={caseData.caseType}
              onValueChange={(val) => update("caseType", val ?? "")}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue>{caseData.caseType ? t(`caseTypes.${caseData.caseType}`) : "Select case type..."}</SelectValue>
              </SelectTrigger>
              <SelectContent className={fileDropdownContentClass}>
                {CASE_TYPES.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value} className={fileSelectItemClass}>
                    {t(`caseTypes.${ct.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display name */}
          <div>
            <label htmlFor="displayName" className={labelClass}>
              {t("fileCase.yourName")} *
              <FieldTooltip content={t("fileCase.yourNameTooltip")} />
            </label>
            <input
              id="displayName"
              type="text"
              value={caseData.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              placeholder={t("fileCase.yourNamePlaceholder")}
              className={inputClass}
              required
            />
          </div>

          {/* Country */}
          <div>
            <label className={labelClass}>
              {t("fileCase.country")} *
              <FieldTooltip content={t("fileCase.countryTooltip")} />
            </label>
            <CountryCombobox
              value={caseData.country}
              onChange={(code) => update("country", code)}
            />
          </div>

          {/* Work period */}
          <div>
            <label className={labelClass}>
              {t("fileCase.workPeriod")} *
              <FieldTooltip content={t("fileCase.workPeriodTooltip")} />
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
                {t("fileCase.amountOwed")}
                <FieldTooltip content={t("fileCase.amountOwedTooltip")} />
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
                    className="w-full bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white min-h-[3rem] py-3 px-3 focus:border-sindicato-warm-white/50 focus:ring-0 text-sm placeholder:text-sindicato-warm-white/30"
                  />
                </div>
                <Select
                  value={caseData.currency}
                  onValueChange={(val) => update("currency", val ?? "USD")}
                >
                  <SelectTrigger className="w-28 bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white py-3 px-3 focus:border-sindicato-warm-white/50 focus:ring-0 text-sm shrink-0 data-[size=default]:h-auto [&_svg]:text-sindicato-warm-white/40">
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
              {t("fileCase.whatHappened")} *{" "}
              <span className="font-normal normal-case tracking-normal ml-1 text-sindicato-warm-white/40">
                (100–500 words)
              </span>
              <FieldTooltip content={t("fileCase.whatHappenedTooltip")} />
            </label>

            {/* Template dropdown (when story is empty) */}
            {caseData.caseType && getTemplateForCaseType(caseData.caseType) && !caseData.story && (
              <div className="mb-3">
                <Select
                  value=""
                  onValueChange={(val) => {
                    if (!val) return;
                    const tpl = getTemplateForCaseType(val);
                    if (tpl) update("story", tpl.scaffold);
                  }}
                >
                  <SelectTrigger className="w-full bg-white/5 border border-white/10 rounded-none text-sindicato-warm-white/60 h-auto py-2 px-3 focus:border-sindicato-warm-white/50 focus:ring-0 text-xs [&_svg]:text-sindicato-warm-white/40">
                    <SelectValue placeholder={`Use a template for ${caseData.caseType!.replace(/_/g, " ")}...`} />
                  </SelectTrigger>
                  <SelectContent className={fileDropdownContentClass}>
                    <SelectItem value={caseData.caseType!} className={fileSelectItemClass}>
                      {getTemplateForCaseType(caseData.caseType!)?.title}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs mt-1 text-sindicato-warm-white/30">
                  {t("fileCase.templateHint") ?? "Pre-fill your story with a suggested template"}
                </p>
              </div>
            )}

            <textarea
              id="story"
              value={caseData.story}
              onChange={(e) => update("story", e.target.value)}
              placeholder={t("fileCase.whatHappenedPlaceholder")}
              rows={8}
              className={`${inputClass} resize-y min-h-[12rem]`}
              required
            />
            <p className="text-xs mt-1 text-left text-sindicato-warm-white/50 italic">
              {t("fileCase.writeInYourLanguage")}
            </p>
            <p
              className={`text-xs mt-1 text-right ${
                wordCount < 100 || wordCount > 500
                  ? "text-sindicato-warm-white/40"
                  : "text-green-400"
              }`}
            >
              {t("fileCase.wordCount", { count: wordCount.toString() })}
              {wordCount < 100 && wordCount > 0 && (
                <span className="ml-1">{t("fileCase.minWords")}</span>
              )}
            </p>

            {/* AI Story Tips */}
            {wordCount >= 50 && caseData.caseType && (
              <StoryTips
                displayName={caseData.displayName}
                country={caseData.country}
                project={caseData.project}
                dateRange={[caseData.workDateStart, caseData.workDateEnd].filter(Boolean).join(" – ")}
                amountOwed={caseData.amountOwed}
                currency={caseData.currency}
                story={caseData.story}
              />
            )}
          </div>

          {/* Age range */}
          <div>
            <label className={labelClass}>
              {t("fileCase.ageRange")}
              <FieldTooltip content={t("fileCase.ageRangeTooltip")} />
            </label>
            <Select
              value={caseData.ageRange}
              onValueChange={(val) => update("ageRange", val ?? "")}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder={t("ageRanges.prefer_not")} />
              </SelectTrigger>
              <SelectContent className={fileDropdownContentClass}>
                {AGE_RANGES.map((ar) => (
                  <SelectItem key={ar.value} value={ar.value} className={fileSelectItemClass}>
                    {t(`ageRanges.${ar.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project name (remote only) */}
          {caseData.vertical === "remote" && (
            <div>
              <label htmlFor="project" className={labelClass}>
                {t("fileCase.projectName")}
                <FieldTooltip content={t("fileCase.projectNameTooltip")} />
              </label>
              <input
                id="project"
                type="text"
                value={caseData.project}
                onChange={(e) => update("project", e.target.value)}
                placeholder={t("fileCase.projectNamePlaceholder")}
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
                {t("fileCase.consentSolicitor")}
                <FieldTooltip content={t("fileCase.consentSolicitorTooltip")} />
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
                {t("fileCase.consentCollective")}
                <FieldTooltip content={t("fileCase.consentCollectiveTooltip")} />
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
                {t("fileCase.consentCompanyNotify")}
                <FieldTooltip content={t("fileCase.consentCompanyNotifyTooltip")} />
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
                {t("fileCase.consentCompanyContact")}
                <FieldTooltip content={t("fileCase.consentCompanyContactTooltip")} />
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
                  {t("fileCase.attestation")} *
                  <FieldTooltip content={t("fileCase.attestationTooltip")} />
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
              {t("common.continue")}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
