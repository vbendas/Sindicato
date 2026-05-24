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
import ShareButtons from "@/components/ShareButtons";

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

const DIRECTION_LABELS: Record<string, string> = {
  worker_to_company: "Worker → Company",
  company_to_worker: "Company → Worker",
  system: "System",
};

const DIRECTION_COLORS: Record<string, string> = {
  worker_to_company: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  company_to_worker: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  system: "bg-white/10 text-sindicato-warm-white/50 border-white/20",
};

const PRESET_LABELS = [
  "NOT ANSWERED",
  "NO RESPONSE",
  "CANNED RESPONSE",
  "CHAT SUPPORT",
  "PHONE CALL",
  "EMAIL SENT",
  "EMAIL RECEIVED",
  "PAYMENT PARTIAL",
  "LEGAL NOTICE",
  "RESOLVED",
];

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
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
        <label className="text-xs text-sindicato-warm-white/60 uppercase tracking-wider">Date & Time</label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-sindicato-warm-white p-2 text-sm"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-sindicato-warm-white/60 uppercase tracking-wider">Direction</label>
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
              {d === "worker_to_company" ? "Worker → Company" : "Company → Worker"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-sindicato-warm-white/60 uppercase tracking-wider">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Messaged billing team on support chat"
          className="bg-white/5 border-white/10 text-sindicato-warm-white"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-sindicato-warm-white/60 uppercase tracking-wider">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the interaction in detail..."
          className="bg-white/5 border-white/10 text-sindicato-warm-white min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-sindicato-warm-white/60 uppercase tracking-wider">Labels</label>
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
            placeholder="Custom label..."
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
            Add
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
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !description}
          className="bg-white/20 text-sindicato-warm-white border border-white/30 hover:bg-white/30"
        >
          {loading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : initial ? (
            "Save Changes"
          ) : (
            "Add Event"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function TimelineSection({ caseId, workerId }: { caseId: string; workerId: string | null }) {
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

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setCurrentUserId(s?.user?.id ?? null))
      .catch(() => setCurrentUserId(null))
      .finally(() => setSessionLoading(false));
  }, []);

  const isOwner = !sessionLoading && currentUserId && workerId && currentUserId === workerId;

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const json = await res.json();
      setEvents(json.data ?? []);
    } catch (err) {
      setError("Failed to load timeline events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <h2 className="text-sindicato-warm-white font-bold text-lg font-[family-name:var(--font-barlow)] uppercase tracking-wider">
          Timeline
        </h2>
        {isOwner && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger className="text-sindicato-warm-white/60 hover:text-sindicato-warm-white transition-colors">
              <PlusIcon className="size-5" />
              <span className="sr-only">Add Event</span>
            </DialogTrigger>
            <DialogContent className="bg-sindicato-slate border border-white/20 text-sindicato-warm-white max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider">
                  Add Timeline Event
                </DialogTitle>
                <DialogDescription className="text-sindicato-warm-white/50 text-xs">
                  Record an interaction with the company.
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
          Sign in to add events to your cases.
        </p>
      )}

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sindicato-warm-white/40 text-sm mb-3">
            No timeline events yet.
          </p>
          {isOwner && (
            <p className="text-sindicato-warm-white/30 text-xs">
              Start tracking your interactions with this company.
            </p>
          )}
        </div>
      ) : (
        <Timeline defaultValue={events.length}>
          {events.map((event, index) => {
            const step = index + 1;
            return (
              <TimelineItem key={event.id} step={step} className="ms-10 pb-10">
                <TimelineHeader>
                  <TimelineSeparator className="bg-white/10 group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-7" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <TimelineDate className="text-sindicato-warm-white/40">
                      {formatDate(event.eventDate)}
                    </TimelineDate>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${DIRECTION_COLORS[event.direction] || "bg-white/10 text-sindicato-warm-white/60 border-white/20"}`}>
                      {DIRECTION_LABELS[event.direction] || event.direction}
                    </span>
                    {event.isAutomatic && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-white/10 text-sindicato-warm-white/50 border border-white/20">
                        AUTO
                      </span>
                    )}
                  </div>
                  <TimelineTitle className="text-sm font-semibold text-sindicato-warm-white mt-1">
                    {event.title || "Untitled Event"}
                  </TimelineTitle>
                  {event.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.labels.map((label) => (
                        <Badge key={label} variant="outline" size="xs" className="text-sindicato-warm-white/50 border-white/20">
                          {label}
                        </Badge>
                      ))}
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
                            <span className="text-[10px] uppercase tracking-wider">share</span>
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
                            {formatDateTime(event.eventDate)}
                          </span>
                          <ChevronRightIcon className="text-sindicato-warm-white/40 size-4 transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                      </FrameHeader>
                      <CollapsibleContent>
                        <FramePanel className="bg-white/5 border-white/10">
                          <p className="text-sindicato-warm-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                            {event.description}
                          </p>
                          {event.emailContent && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="text-sindicato-warm-white/40 text-[10px] uppercase tracking-wider mb-1">
                                Email Content
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
                        Share this event
                      </p>
                      <ShareButtons
                        url={typeof window !== "undefined" ? window.location.origin + window.location.pathname : ""}
                        title={`${event.title || "Timeline event"} — ${formatDate(event.eventDate)}`}
                        description={event.description.slice(0, 200)}
                        variant="event"
                        stats={{ date: formatDate(event.eventDate) }}
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
          })}
        </Timeline>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="bg-sindicato-slate border border-white/20 text-sindicato-warm-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider">
              Edit Timeline Event
            </DialogTitle>
            <DialogDescription className="text-sindicato-warm-white/50 text-xs">
              Update the event details.
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
              Delete Event
            </DialogTitle>
            <DialogDescription className="text-sindicato-warm-white/50 text-xs">
              Are you sure you want to delete this timeline event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              className="border-white/20 text-sindicato-warm-white/70"
            >
              Cancel
            </Button>
            <Button
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
