"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline";
import { Badge } from "@/components/reui/badge";
import {
  Frame,
  FrameHeader,
  FramePanel,
} from "@/components/reui/frame";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRightIcon, PlusIcon, PencilIcon, Trash2Icon, Loader2Icon, Share2Icon, XIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import ShareButtons from "@/components/ShareButtons";
import { CaseTag } from "@/components/CaseTag";
import { useT, useLocale } from "@/lib/i18n";
import { useTranslation } from "@/hooks/useTranslation";

interface TimelineEvent {
  id: string;
  caseId: string;
  eventType: string;
  eventDate: string;
  title: string | null;
  description: string;
  direction: "worker_to_company" | "company_to_worker" | "system";
  labels: string[];
  isAutomatic: boolean;
  emailContent: string | null;
  responseReceived: boolean;
  createdAt: string;
}

interface CaseTagData {
  id: string;
  caseId: string;
  timelineEventId: string | null;
  category: string;
  tagName: string;
  confidence: number;
  sourceText: string | null;
  workerOverride: string | null;
  source: string;
  createdAt: string;
}

const DIRECTION_COLORS: Record<string, string> = {
  worker_to_company: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  company_to_worker: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  system: "bg-white/10 text-sindicato-warm-white/50 border-white/20",
};

const LABEL_I18N_MAP: Record<string, string> = {
  "CASE FILED": "timelineSection.labelCaseFiled",
  "EMAIL SENT": "timelineSection.labelEmailSent",
  "RESOLVED": "timelineSection.labelResolved",
  "LEGAL NOTICE": "timelineSection.labelLegal",
  "PHONE CALL": "timelineSection.labelPhone",
  "CHAT SUPPORT": "timelineSection.labelChat",
  "CANNED RESPONSE": "timelineSection.labelCanned",
  "NO RESPONSE": "timelineSection.labelNoResponse",
  "NOT ANSWERED": "timelineSection.labelNotAnswered",
  "PAYMENT PARTIAL": "timelineSection.labelPayment",
};

function getEventTitle(event: TimelineEvent, companyName: string, t: (key: string, params?: Record<string, string>) => string): string {
  // Map event types to translation keys
  const titleMap: Record<string, string> = {
    "case_updated": "timelineSection.eventTitleCaseFiled",
    "email_sent": "timelineSection.eventTitleEmailAccessed",
    "resolved": "timelineSection.eventTitleResolution",
    "company_response": "timelineSection.eventTitleCompanyResponse",
    "worker_response": "timelineSection.eventTitleWorkerResponse",
  };
  
  // Check if title starts with 'Started working on'
  if (event.title?.startsWith("Started working on")) {
    return t("timelineSection.eventTitleStartedWorking", { company: companyName });
  }
  
  // Check if title starts with 'Case filed against'
  if (event.title?.startsWith("Case filed against")) {
    return t("timelineSection.eventTitleCaseFiled", { company: companyName });
  }
  
  // Check if title matches known hardcoded titles
  if (event.title === "Company Response") {
    return t("timelineSection.eventTitleCompanyResponse");
  }
  if (event.title === "Email Access Requested") {
    return t("timelineSection.eventTitleEmailAccessed");
  }
  if (event.title === "Company Reply") {
    return t("timelineSection.eventTitleCompanyReply");
  }
  if (event.title === "Worker Reply") {
    return t("timelineSection.eventTitleWorkerReply");
  }
  
  // Check if we have a translation key for this event type
  const translationKey = titleMap[event.eventType];
  if (translationKey) {
    return t(translationKey, { company: companyName });
  }
  
  // Fallback to event title or untitled
  return event.title || t("timelineSection.untitled");
}

const EVENT_TYPES = [
  "email_sent",
  "no_response",
  "canned_response",
  "chat_support",
  "phone_call",
  "legal_notice",
  "payment_partial",
  "case_updated",
  "resolved",
  "other",
] as const;

function formatDate(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface EventFormProps {
  initial?: Partial<TimelineEvent>;
  onSubmit: (data: {
    eventType: string;
    eventDate: string;
    title: string;
    description: string;
    direction: "worker_to_company" | "company_to_worker" | "system";
    labels: string[];
  }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function EventForm({ initial, onSubmit, onCancel, loading }: EventFormProps) {
  const t = useT();
  
  const PRESET_LABELS = [
    t("timelineSection.labelNotAnswered"),
    t("timelineSection.labelNoResponse"),
    t("timelineSection.labelCanned"),
    t("timelineSection.labelChat"),
    t("timelineSection.labelPhone"),
    t("timelineSection.labelEmailSent"),
    t("timelineSection.labelEmailReceived"),
    t("timelineSection.labelPayment"),
    t("timelineSection.labelLegal"),
    t("timelineSection.labelResolved"),
  ];
  
  const [eventType, setEventType] = useState(initial?.eventType ?? "other");
  const [eventDate, setEventDate] = useState(
    initial?.eventDate
      ? new Date(initial.eventDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [direction, setDirection] = useState<"worker_to_company" | "company_to_worker" | "system">(
    initial?.direction ?? "worker_to_company"
  );
  const [labels, setLabels] = useState<string[]>(initial?.labels ?? []);
  const [customLabel, setCustomLabel] = useState("");

  const toggleLabel = (label: string) => {
    setLabels((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const addCustomLabel = () => {
    const trimmed = customLabel.trim().toUpperCase();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels((prev) => [...prev, trimmed]);
      setCustomLabel("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      eventType,
      eventDate: new Date(eventDate).toISOString(),
      title,
      description,
      direction,
      labels,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-sindicato-warm-white/60 uppercase tracking-wider">{t("timelineSection.formDatetime")}</label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-sindicato-warm-white p-2 text-sm"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-sindicato-warm-white/60 uppercase tracking-wider">{t("timelineSection.formDirection")}</label>
        <div className="flex gap-2">
          {(["worker_to_company", "company_to_worker"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={`flex-1 p-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                direction === d
                  ? "bg-white/20 border-white/40 text-sindicato-warm-white"
                  : "bg-white/5 border-white/10 text-sindicato-warm-white/50 hover:bg-white/10"
              }`}
            >
              {d === "worker_to_company" ? t("timelineSection.directionWorker") : t("timelineSection.directionCompany")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-sindicato-warm-white/60 uppercase tracking-wider">{t("timelineSection.formTitle")}</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("timelineSection.formTitlePlaceholder")}
          className="bg-white/5 border-white/10 text-sindicato-warm-white"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-sindicato-warm-white/60 uppercase tracking-wider">{t("timelineSection.formDescription")}</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("timelineSection.formDescriptionPlaceholder")}
          className="bg-white/5 border-white/10 text-sindicato-warm-white min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-sindicato-warm-white/60 uppercase tracking-wider">{t("timelineSection.formLabels")}</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {PRESET_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleLabel(label)}
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border transition-colors ${
                labels.includes(label)
                  ? "bg-white/20 border-white/40 text-sindicato-warm-white"
                  : "bg-white/5 border-white/10 text-sindicato-warm-white/50 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder={t("timelineSection.formCustomLabelPlaceholder")}
            className="bg-white/5 border-white/10 text-sindicato-warm-white flex-1"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomLabel())}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomLabel}
            disabled={!customLabel.trim()}
            className="border-white/20 text-sindicato-warm-white/70"
          >
            {t("timelineSection.formAddLabel")}
          </Button>
        </div>
        {labels.filter((l) => !PRESET_LABELS.includes(l)).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {labels.filter((l) => !PRESET_LABELS.includes(l)).map((l) => (
              <Badge key={l} variant="outline" size="sm" className="text-sindicato-warm-white/70 border-white/20">
                {l}
                <button
                  type="button"
                  onClick={() => setLabels((prev) => prev.filter((x) => x !== l))}
                  className="ml-1 text-sindicato-warm-white/40 hover:text-sindicato-warm-white"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-white/20 text-sindicato-warm-white/70"
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={loading || !description}
          className="bg-white/20 text-sindicato-warm-white border border-white/30 hover:bg-white/30"
        >
          {loading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : initial ? (
            t("timelineSection.formSave")
          ) : (
            t("timelineSection.formAddEvent")
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

function TimelineEventItem({
  event,
  index,
  isOwner,
  sharingEvent,
  setSharingEvent,
  setEditingEvent,
  setConfirmDelete,
  session,
  companyName,
  eventTags,
}: {
  event: TimelineEvent;
  index: number;
  isOwner: boolean;
  sharingEvent: string | null;
  setSharingEvent: (id: string | null) => void;
  setEditingEvent: (event: TimelineEvent | null) => void;
  setConfirmDelete: (id: string | null) => void;
  session: Session | null;
  companyName?: string;
  eventTags?: CaseTagData[];
}) {
  const t = useT();
  const { locale } = useLocale();
  
  const DIRECTION_LABELS: Record<string, string> = {
    worker_to_company: t("timelineSection.directionWorker"),
    company_to_worker: t("timelineSection.directionCompany"),
    system: t("timelineSection.directionSystem"),
  };
  
  const { 
    translatedText: descriptionTranslation, 
    isTranslating: isDescriptionTranslating,
    displayText: displayDescription 
  } = useTranslation(
    event.description,
    undefined,
    locale !== 'en'
  );

  const step = index + 1;
  
  return (
    <TimelineItem key={event.id} step={step} className="ms-10 pb-10">
      <TimelineHeader>
        <TimelineSeparator className="bg-white/10 group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-7" />
        <div className="flex items-center gap-2 flex-wrap">
          <TimelineDate className="text-sindicato-warm-white/40">
            {formatDate(event.eventDate, locale)}
          </TimelineDate>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${DIRECTION_COLORS[event.direction] || "bg-white/10 text-sindicato-warm-white/60 border-white/20"}`}>
            {DIRECTION_LABELS[event.direction] || event.direction}
          </span>
          {event.isAutomatic && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-white/10 text-sindicato-warm-white/50 border border-white/20">
              {t("timelineSection.badgeAuto")}
            </span>
          )}
        </div>
        <TimelineTitle className="text-sm font-semibold text-sindicato-warm-white mt-1">
          {getEventTitle(event, companyName || "", t)}
        </TimelineTitle>
        {event.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {event.labels.map((label) => {
              const i18nKey = LABEL_I18N_MAP[label];
              const displayLabel = i18nKey ? t(i18nKey) : label;
              return (
                <Badge key={label} variant="outline" size="xs" className="text-sindicato-warm-white/50 border-white/20">
                  {displayLabel}
                </Badge>
              );
            })}
          </div>
        )}
        <TimelineIndicator
          className={`bg-white/10 group-data-completed/timeline-item:bg-white/20 flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7 ${
            event.direction === "company_to_worker" ? "ring-amber-500/30 ring-2" : ""
          }`}
        >
          <div className={`size-2 rounded-full ${
            event.direction === "worker_to_company" ? "bg-blue-400" :
            event.direction === "company_to_worker" ? "bg-amber-400" :
            "bg-white/40"
          }`} />
        </TimelineIndicator>
      </TimelineHeader>
      <TimelineContent className="mt-2">
        <Frame stacked dense spacing="sm" className="bg-white/[0.03] border border-white/10">
          <Collapsible className="group/collapsible">
            <FrameHeader className="flex grow flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSharingEvent(sharingEvent === event.id ? null : event.id);
                  }}
                  className="inline-flex items-center gap-1 text-sindicato-warm-white/40 hover:text-sindicato-warm-white transition-colors p-0.5"
                >
                  <Share2Icon className="size-3" />
                  <span className="text-[10px] uppercase tracking-wider">{t("timelineSection.share")}</span>
                </button>
                {isOwner && !event.isAutomatic && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEvent(event);
                      }}
                      className="text-sindicato-warm-white/40 hover:text-sindicato-warm-white transition-colors p-0.5"
                    >
                      <PencilIcon className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(event.id);
                      }}
                      className="text-red-400/60 hover:text-red-400 transition-colors p-0.5"
                    >
                      <Trash2Icon className="size-3" />
                    </button>
                  </>
                )}
              </div>
              <CollapsibleTrigger className="flex items-center gap-2">
                <span className="text-sindicato-warm-white/50 text-xs">
                  {formatDateTime(event.eventDate, locale)}
                </span>
                <ChevronRightIcon className="text-sindicato-warm-white/40 size-4 transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </FrameHeader>
            <CollapsibleContent>
              <FramePanel className="bg-white/5 border-white/10">
                {isDescriptionTranslating && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                    <span className="text-blue-400 text-[10px] uppercase tracking-wider">
                      {t("common.translating")}
                    </span>
                  </div>
                )}
                {descriptionTranslation && !isDescriptionTranslating && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400 font-[family-name:var(--font-jetbrains)]">
                      {t("caseDetail.machineTranslated")}
                    </span>
                  </div>
                )}
                <p className="text-sindicato-warm-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                  {displayDescription}
                </p>
                {eventTags && eventTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
                    {eventTags.map((tag) => (
                      <CaseTag
                        key={tag.id}
                        tag={tag}
                      />
                    ))}
                  </div>
                )}
                {event.emailContent && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sindicato-warm-white/40 text-[10px] uppercase tracking-wider mb-1">
                      {t("timelineSection.emailContent")}
                    </p>
                    <p className="text-sindicato-warm-white/50 text-xs whitespace-pre-wrap">
                      {event.emailContent}
                    </p>
                  </div>
                )}
              </FramePanel>
            </CollapsibleContent>
          </Collapsible>
        </Frame>

        {/* Share popover */}
        {sharingEvent === event.id && (
          <div className="mt-3 bg-sindicato-slate border border-white/10 p-4 relative">
            <button
              onClick={() => setSharingEvent(null)}
              className="absolute top-3 right-3 text-sindicato-warm-white/30 hover:text-sindicato-warm-white transition-colors"
            >
              <XIcon className="size-4" />
            </button>
            <p className="text-sindicato-warm-white/40 text-[10px] uppercase tracking-widest mb-3 font-[family-name:var(--font-jetbrains)]">
              {t("timelineSection.shareEventLabel")}
            </p>
            <ShareButtons
              url={typeof window !== "undefined" ? window.location.origin + window.location.pathname : ""}
              title={`${event.title || "Timeline event"} — ${formatDate(event.eventDate, locale)}`}
              description={event.description.slice(0, 200)}
              variant="event"
              stats={{ date: formatDate(event.eventDate, locale) }}
              entityType="timeline_event"
              entityId={event.id}
              eventId={event.id}
              isAuth={!!session}
            />
          </div>
        )}
      </TimelineContent>
    </TimelineItem>
  );
}

export default function TimelineSection({ caseId, workerId, companyName }: { caseId: string; workerId: string | null; companyName?: string }) {
  const t = useT();
  const { data: session } = useSession();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sharingEvent, setSharingEvent] = useState<string | null>(null);
  const [timelineTags, setTimelineTags] = useState<CaseTagData[]>([]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setCurrentUserId(s?.user?.id ?? null))
      .catch(() => setCurrentUserId(null))
      .finally(() => setSessionLoading(false));
  }, []);

  const isOwner = Boolean(!sessionLoading && currentUserId && workerId && currentUserId === workerId);

  const fetchEvents = useCallback(async () => {
    try {
      const [eventsRes, tagsRes] = await Promise.all([
        fetch(`/api/cases/${caseId}/timeline`),
        fetch(`/api/cases/${caseId}/tags`),
      ]);
      if (!eventsRes.ok) throw new Error("Failed to fetch events");
      const eventsJson = await eventsRes.json();
      setEvents(eventsJson.data ?? []);
      if (tagsRes.ok) {
        const tagsJson = await tagsRes.json();
        setTimelineTags(tagsJson.data ?? []);
      }
    } catch (err) {
      setError("Failed to load timeline events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    let isMounted = true;
    
    const loadEvents = async () => {
      try {
        const [eventsRes, tagsRes] = await Promise.all([
          fetch(`/api/cases/${caseId}/timeline`),
          fetch(`/api/cases/${caseId}/tags`),
        ]);
        if (!eventsRes.ok) throw new Error("Failed to fetch events");
        const eventsJson = await eventsRes.json();
        if (isMounted) {
          setEvents(eventsJson.data ?? []);
        }
        if (tagsRes.ok && isMounted) {
          const tagsJson = await tagsRes.json();
          setTimelineTags(tagsJson.data ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load timeline events");
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadEvents();
    
    return () => {
      isMounted = false;
    };
  }, [caseId]);

  const handleAdd = async (data: Parameters<EventFormProps["onSubmit"]>[0]) => {
    setFormLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add event");
      await fetchEvents();
      setShowAddDialog(false);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data: Parameters<EventFormProps["onSubmit"]>[0]) => {
    if (!editingEvent) return;
    setFormLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update event");
      await fetchEvents();
      setEditingEvent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline/${eventId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete event");
      await fetchEvents();
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="size-6 text-sindicato-warm-white/40 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={fetchEvents}
          className="mt-2 text-sindicato-warm-white/50 hover:text-sindicato-warm-white text-xs uppercase tracking-wider"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <h2 className="text-sindicato-warm-white font-bold text-lg font-[family-name:var(--font-barlow)] uppercase tracking-wider">
          {t("timelineSection.title")}
        </h2>
        {isOwner && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger className="text-sindicato-warm-white/60 hover:text-sindicato-warm-white transition-colors">
              <PlusIcon className="size-5" />
              <span className="sr-only">{t("timelineSection.formAddEvent")}</span>
            </DialogTrigger>
            <DialogContent className="bg-sindicato-slate border border-white/20 text-sindicato-warm-white max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider">
                  {t("timelineSection.addDialogTitle")}
                </DialogTitle>
                <DialogDescription className="text-sindicato-warm-white/50 text-xs">
                  {t("timelineSection.addDialogDescription")}
                </DialogDescription>
              </DialogHeader>
              <EventForm
                onSubmit={handleAdd}
                onCancel={() => setShowAddDialog(false)}
                loading={formLoading}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isOwner && (
        <p className="text-sindicato-warm-white/30 text-xs mb-4 italic">
          {t("timelineSection.signInPrompt")}
        </p>
      )}

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sindicato-warm-white/40 text-sm mb-3">
            {t("timelineSection.empty")}
          </p>
          {isOwner && (
            <p className="text-sindicato-warm-white/30 text-xs">
              {t("timelineSection.emptyHint")}
            </p>
          )}
        </div>
      ) : (
        <Timeline defaultValue={events.length}>
          {events.map((event, index) => (
            <TimelineEventItem
              key={event.id}
              event={event}
              index={index}
              isOwner={isOwner}
              sharingEvent={sharingEvent}
              setSharingEvent={setSharingEvent}
              setEditingEvent={setEditingEvent}
              setConfirmDelete={setConfirmDelete}
              session={session}
              companyName={companyName}
              eventTags={timelineTags.filter((t) => t.timelineEventId === event.id)}
            />
          ))}
        </Timeline>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="bg-sindicato-slate border border-white/20 text-sindicato-warm-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider">
              {t("timelineSection.editDialogTitle")}
            </DialogTitle>
            <DialogDescription className="text-sindicato-warm-white/50 text-xs">
              {t("timelineSection.editDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <EventForm
              initial={{
                eventType: editingEvent.eventType,
                eventDate: editingEvent.eventDate,
                title: editingEvent.title ?? "",
                description: editingEvent.description,
                direction: editingEvent.direction,
                labels: editingEvent.labels,
              }}
              onSubmit={handleEdit}
              onCancel={() => setEditingEvent(null)}
              loading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="bg-sindicato-slate border border-white/20 text-sindicato-warm-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider">
              {t("timelineSection.deleteDialogTitle")}
            </DialogTitle>
            <DialogDescription className="text-sindicato-warm-white/50 text-xs">
              {t("timelineSection.deleteDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              className="border-white/20 text-sindicato-warm-white/70"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
            >
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
