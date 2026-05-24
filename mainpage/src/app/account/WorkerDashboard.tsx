"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { nanoid } from "nanoid";

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

const EVENT_TYPE_OPTIONS = [
  { value: "email_sent", label: "Email Sent" },
  { value: "no_response", label: "No Response" },
  { value: "canned_response", label: "Canned / Template Response" },
  { value: "chat_support", label: "Support Chat" },
  { value: "phone_call", label: "Phone Call" },
  { value: "legal_notice", label: "Legal Notice" },
  { value: "payment_partial", label: "Partial Payment Received" },
  { value: "case_updated", label: "Case Updated" },
  { value: "resolved", label: "Resolved" },
  { value: "other", label: "Other" },
];

const EVENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  EVENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

const RESOLUTION_LABELS: Record<string, string> = {
  none: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const RESOLUTION_COLORS: Record<string, string> = {
  none: "bg-sindicato-charcoal/10 text-sindicato-charcoal/60",
  in_progress: "bg-sindicato-gold/20 text-sindicato-gold",
  resolved: "bg-green-100 text-green-700",
};

interface CaseRow {
  id: string;
  caseType: string | null;
  displayName: string;
  country: string | null;
  amountOwed: string;
  currency: string;
  resolutionStatus: string;
  status: string;
  createdAt: Date;
  companyName: string;
  companySlug: string;
}

interface TimelineEvent {
  id: string;
  eventType: string;
  eventDate: Date;
  description: string;
  responseReceived: boolean;
  createdAt: Date;
}

interface WorkerDashboardProps {
  cases: CaseRow[];
  timelineMap: Record<string, TimelineEvent[]>;
  workerId: string;
}

interface EventDraft {
  eventType: string;
  eventDate: string;
  description: string;
  responseReceived: boolean;
}

function emptyDraft(): EventDraft {
  return {
    eventType: "email_sent",
    eventDate: format(new Date(), "yyyy-MM-dd"),
    description: "",
    responseReceived: false,
  };
}

export default function WorkerDashboard({
  cases,
  timelineMap,
  workerId,
}: WorkerDashboardProps) {
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [showAddEventFor, setShowAddEventFor] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, EventDraft>>({});
  const [localEvents, setLocalEvents] = useState<
    Record<string, TimelineEvent[]>
  >({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function getEvents(caseId: string): TimelineEvent[] {
    return [...(timelineMap[caseId] || []), ...(localEvents[caseId] || [])];
  }

  async function handleAddEvent(caseId: string) {
    const draft = drafts[caseId] || emptyDraft();
    if (!draft.description.trim()) return;

    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: draft.eventType,
          eventDate: new Date(draft.eventDate).toISOString(),
          description: draft.description.trim(),
          responseReceived: draft.responseReceived,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error || "Failed to save event.");
        return;
      }

      const newEvent: TimelineEvent = {
        id: nanoid(),
        eventType: draft.eventType,
        eventDate: new Date(draft.eventDate),
        description: draft.description.trim(),
        responseReceived: draft.responseReceived,
        createdAt: new Date(),
      };

      setLocalEvents((prev) => ({
        ...prev,
        [caseId]: [newEvent, ...(prev[caseId] || [])],
      }));
      setDrafts((prev) => ({ ...prev, [caseId]: emptyDraft() }));
      setShowAddEventFor(null);
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Suppress unused warning — workerId used for future features
  void workerId;

  const labelClass =
    "text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold text-sindicato-charcoal/50";
  const inputClass =
    "w-full bg-sindicato-smoked-charcoal border border-sindicato-charcoal/20 rounded-none text-sindicato-warm-white p-2.5 focus:border-sindicato-bordeaux focus:outline-none focus:ring-0 transition-colors text-sm";

  if (cases.length === 0) {
    return (
      <div className="bg-sindicato-smoked-charcoal border border-sindicato-charcoal/10 p-10 text-center">
        <p className="text-sindicato-warm-white/50 text-sm font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-4">
          No cases filed yet
        </p>
        <Link
          href="/file"
          className="bg-sindicato-bordeaux text-sindicato-warm-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-bordeaux-dark transition-colors font-[family-name:var(--font-barlow)] inline-block"
        >
          File Your First Case
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cases.map((c) => {
        const isExpanded = expandedCaseId === c.id;
        const events = getEvents(c.id);
        const isAddingEvent = showAddEventFor === c.id;
        const draft = drafts[c.id] || emptyDraft();

        return (
          <div
            key={c.id}
            className="bg-sindicato-smoked-charcoal border border-sindicato-charcoal/10"
          >
            {/* Case header */}
            <button
              type="button"
              onClick={() => setExpandedCaseId(isExpanded ? null : c.id)}
              className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-sindicato-charcoal/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-bold text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider">
                    {c.companyName}
                  </span>
                  {c.caseType && (
                    <span className="text-xs text-sindicato-bordeaux font-[family-name:var(--font-barlow)] uppercase tracking-wider">
                      · {CASE_TYPE_LABELS[c.caseType] || c.caseType}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 font-bold font-[family-name:var(--font-barlow)] uppercase tracking-wider ${RESOLUTION_COLORS[c.resolutionStatus] || RESOLUTION_COLORS.none}`}
                  >
                    {RESOLUTION_LABELS[c.resolutionStatus] ||
                      c.resolutionStatus}
                  </span>
                  <span className="text-xs text-sindicato-charcoal/40">
                    Filed {format(new Date(c.createdAt), "d MMM yyyy")}
                  </span>
                  {parseFloat(c.amountOwed) > 0 && (
                    <span className="text-xs text-sindicato-warm-white/60">
                      ${c.amountOwed} {c.currency}
                    </span>
                  )}
                  {events.length > 0 && (
                    <span className="text-xs text-sindicato-warm-white/40">
                      {events.length} timeline event
                      {events.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-sindicato-warm-white/30 flex-shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-sindicato-charcoal/10 p-5">
                {/* Timeline events */}
                {events.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <div className="w-2 h-2 rounded-full bg-sindicato-bordeaux/40 mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)] text-sindicato-bordeaux">
                              {EVENT_TYPE_LABELS[ev.eventType] || ev.eventType}
                            </span>
                            <span className="text-xs text-sindicato-warm-white/40">
                              {format(new Date(ev.eventDate), "d MMM yyyy")}
                            </span>
                          </div>
                          <p className="text-sm text-sindicato-warm-white/70">
                            {ev.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add event form */}
                {isAddingEvent ? (
                  <div className="border border-sindicato-bordeaux/20 bg-sindicato-charcoal/20 p-4 space-y-3">
                    <div>
                      <label className={labelClass}>Event type</label>
                      <select
                        value={draft.eventType}
                        onChange={(e) =>
                          setDrafts((d) => ({
                            ...d,
                            [c.id]: {
                              ...(d[c.id] || emptyDraft()),
                              eventType: e.target.value,
                            },
                          }))
                        }
                        className={inputClass}
                      >
                        {EVENT_TYPE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Date</label>
                      <input
                        type="date"
                        value={draft.eventDate}
                        onChange={(e) =>
                          setDrafts((d) => ({
                            ...d,
                            [c.id]: {
                              ...(d[c.id] || emptyDraft()),
                              eventDate: e.target.value,
                            },
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        value={draft.description}
                        onChange={(e) =>
                          setDrafts((d) => ({
                            ...d,
                            [c.id]: {
                              ...(d[c.id] || emptyDraft()),
                              description: e.target.value,
                            },
                          }))
                        }
                        placeholder="What happened?"
                        rows={2}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                    {saveError && (
                      <p className="text-xs text-red-600">{saveError}</p>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleAddEvent(c.id)}
                        disabled={saving || !draft.description.trim()}
                        className="bg-sindicato-bordeaux text-sindicato-warm-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)] hover:bg-sindicato-bordeaux-dark transition-colors disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddEventFor(null);
                          setSaveError("");
                        }}
                        className="text-sindicato-warm-white/50 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] hover:text-sindicato-warm-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEventFor(c.id);
                      setSaveError("");
                    }}
                    className="border border-sindicato-bordeaux/30 text-sindicato-bordeaux px-4 py-1.5 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)] hover:bg-sindicato-bordeaux/5 transition-colors"
                  >
                    + Add Update
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
