"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { format } from "date-fns";
import { useT } from "@/lib/i18n";
import type { CaseFormData, TimelineEvent } from "../FilingWizard";

const EVENT_TYPE_KEYS: Record<string, string> = {
  email_sent: "timeline.eventEmailSent",
  no_response: "timeline.eventNoResponse",
  canned_response: "timeline.eventCannedResponse",
  chat_support: "timeline.eventChatSupport",
  phone_call: "timeline.eventPhoneCall",
  legal_notice: "timeline.eventLegalNotice",
  payment_partial: "timeline.eventPaymentPartial",
  case_updated: "timeline.eventCaseUpdated",
  other: "timeline.eventOther",
};

const EVENT_TYPE_VALUES = [
  "email_sent",
  "no_response",
  "canned_response",
  "chat_support",
  "phone_call",
  "legal_notice",
  "payment_partial",
  "case_updated",
  "other",
];

interface TimelineStepProps {
  caseData: CaseFormData;
  events: TimelineEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TimelineEvent[]>>;
  onBack: () => void;
  onNext: () => void;
}

interface EventDraft {
  eventType: string;
  eventDate: string;
  description: string;
  responseReceived: boolean;
}

const emptyDraft = (): EventDraft => ({
  eventType: "email_sent",
  eventDate: format(new Date(), "yyyy-MM-dd"),
  description: "",
  responseReceived: false,
});

export default function TimelineStep({
  caseData,
  events,
  setEvents,
  onBack,
  onNext,
}: TimelineStepProps) {
  const t = useT();
  const companyDisplay = caseData.companyName || "the company";
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<EventDraft>(emptyDraft());
  const [draftError, setDraftError] = useState("");

  function handleAddEvent() {
    setDraftError("");
    if (!draft.description.trim()) {
      setDraftError(t("timeline.errorDescription"));
      return;
    }
    const event: TimelineEvent = {
      id: nanoid(),
      eventType: draft.eventType,
      eventDate: new Date(draft.eventDate),
      description: draft.description.trim(),
      responseReceived: draft.responseReceived,
    };
    setEvents((prev) => [event, ...prev]);
    setDraft(emptyDraft());
    setShowForm(false);
  }

  function handleRemove(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  const labelClass =
    "block text-sindicato-warm-white/70 mb-1.5 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold";
  const inputClass =
    "w-full bg-white/10 border border-white/20 rounded-none text-sindicato-warm-white p-3 focus:border-sindicato-warm-white/50 focus:outline-none focus:ring-0 transition-colors text-sm placeholder:text-sindicato-warm-white/30";
  const primaryBtnClass =
    "w-full bg-sindicato-bordeaux text-sindicato-warm-white py-3 px-6 font-bold uppercase tracking-wider hover:bg-sindicato-bordeaux-dark transition-colors font-[family-name:var(--font-barlow)]";
  const secondaryBtnClass =
    "text-sindicato-warm-white/60 hover:text-sindicato-warm-white transition-colors text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-1">
          {t("timeline.title")}
        </h2>
        <p className="text-sindicato-warm-white/60 text-sm mb-8">
          {t("timeline.subtitle", { company: companyDisplay })}
        </p>

        {/* Event list */}
        {events.length > 0 && (
          <div className="space-y-2 mb-6">
            {events.map((ev) => (
                <div
                  key={ev.id}
                  className="border border-white/10 p-4 flex items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)] text-sindicato-bordeaux">
                        {t(EVENT_TYPE_KEYS[ev.eventType] || `timeline.eventOther`)}
                      </span>
                      <span className="text-sindicato-warm-white/30 text-xs">·</span>
                      <span className="text-xs text-sindicato-warm-white/50">
                        {format(ev.eventDate, "d MMM yyyy")}
                      </span>
                      {ev.responseReceived && (
                        <>
                          <span className="text-sindicato-warm-white/30 text-xs">·</span>
                          <span className="text-xs text-sindicato-warm-white/50">{t("timeline.responseReceived")}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-sindicato-warm-white/80 line-clamp-2">
                      {ev.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(ev.id)}
                    className="text-sindicato-warm-white/30 hover:text-sindicato-bordeaux transition-colors flex-shrink-0 mt-0.5"
                  aria-label="Remove event"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add event form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border border-sindicato-bordeaux/30 bg-sindicato-parchment/30 p-5 mb-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)] text-sindicato-charcoal/70">
                  {t("timeline.newInteraction")}
                </h3>
                <div>
                  <label className={labelClass}>{t("timeline.typeLabel")}</label>
                  <select
                    value={draft.eventType}
                    onChange={(e) => setDraft((d) => ({ ...d, eventType: e.target.value }))}
                    className={inputClass}
                  >
                    {EVENT_TYPE_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {t(EVENT_TYPE_KEYS[value])}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("timeline.dateLabel")}</label>
                  <input
                    type="date"
                    value={draft.eventDate}
                    onChange={(e) => setDraft((d) => ({ ...d, eventDate: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("timeline.descriptionLabel")}</label>
                  <textarea
                    value={draft.description}
                    onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    placeholder={t("timeline.descriptionPlaceholder")}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.responseReceived}
                    onChange={(e) => setDraft((d) => ({ ...d, responseReceived: e.target.checked }))}
                    className="accent-sindicato-bordeaux"
                  />
                  <span className="text-xs text-sindicato-charcoal/70">
                    {t("timeline.responseCheckbox")}
                  </span>
                </label>
                {draftError && <p className="text-xs text-red-600">{draftError}</p>}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAddEvent}
                    className="bg-sindicato-bordeaux text-sindicato-warm-white px-5 py-2 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)] hover:bg-sindicato-bordeaux-dark transition-colors"
                  >
                    {t("timeline.add")}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setDraft(emptyDraft()); setDraftError(""); }}
                    className="text-sindicato-charcoal/50 hover:text-sindicato-charcoal text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold transition-colors"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state or add button */}
        {!showForm && (
          events.length === 0 ? (
            <div className="border border-dashed border-white/20 p-10 flex flex-col items-center justify-center gap-4 mb-8">
              <div className="text-sindicato-warm-white/30">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 40 40">
                  <rect x="8" y="6" width="24" height="28" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="14" y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="14" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="14" y1="26" x2="20" y2="26" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="text-sindicato-charcoal/40 text-sm font-[family-name:var(--font-barlow)] uppercase tracking-wider">
                {t("timeline.noEvents")}
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="border border-sindicato-bordeaux text-sindicato-bordeaux px-5 py-2 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)] hover:bg-sindicato-bordeaux/5 transition-colors"
              >
                {t("timeline.addEvent")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="border border-sindicato-bordeaux text-sindicato-bordeaux px-5 py-2 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)] hover:bg-sindicato-bordeaux/5 transition-colors mb-6 block"
            >
              {t("timeline.addAnother")}
            </button>
          )
        )}

        <div className="flex flex-col gap-3">
          <button type="button" onClick={onNext} className={primaryBtnClass}>
            {t("common.continue")}
          </button>
          <div className="flex items-center justify-between">
            <button type="button" onClick={onBack} className={secondaryBtnClass}>
              {t("common.back")}
            </button>
            <button
              type="button"
              onClick={onNext}
              className="text-sindicato-charcoal/40 hover:text-sindicato-charcoal/60 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] transition-colors"
            >
              {t("timeline.skip")}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
