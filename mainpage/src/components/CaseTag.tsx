"use client";

import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { CheckIcon, XIcon } from "lucide-react";

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  payment_structure: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  quality_review: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  communication: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/20",
  },
  project_lifecycle: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  worker_action: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
};

interface CaseTagData {
  id: string;
  caseId: string;
  timelineEventId: string | null;
  category: string;
  tagName: string;
  confidence: number;
  sourceText: string | null;
  workerOverride: string | null;
  createdAt: string;
}

interface CaseTagProps {
  tag: CaseTagData;
  isOwner?: boolean;
  onOverride?: (
    tagId: string,
    override: "confirmed" | "rejected"
  ) => void;
}

const TAG_I18N_MAP: Record<string, string> = {
  "Hourly payment terms not honored": "tags.hourly_payment_not_honored",
  "Per-task payment terms not honored": "tags.pertask_payment_not_honored",
  "Completion-based payment not honored": "tags.completion_payment_not_honored",
  "Approval condition imposed retroactively": "tags.approval_condition_retroactive",
  "Retroactive term change": "tags.retroactive_term_change",
  "Payment cap / limit": "tags.payment_cap_limit",
  "No feedback provided": "tags.no_feedback_provided",
  "Undefined quality standard": "tags.undefined_quality_standard",
  "Post-hoc quality claim": "tags.post_hoc_quality_claim",
  "Tasks removed / deleted": "tags.tasks_removed_deleted",
  "Ignored messages": "tags.ignored_messages",
  "Channel lockout": "tags.channel_lockout",
  "Support deflection": "tags.support_deflection",
  "Alias management": "tags.alias_management",
  "Project paused / ended abruptly": "tags.project_paused_ended",
  "Project deleted from dashboard": "tags.project_deleted_dashboard",
  "Task allocation dropped": "tags.task_allocation_dropped",
  "Constructive termination": "tags.constructive_termination",
  "DLSE filing indicated": "tags.dlse_filing_indicated",
  "Legal counsel sought": "tags.legal_counsel_sought",
  "Collective action interest": "tags.collective_action_interest",
  "Public documentation": "tags.public_documentation",
};

export function CaseTag({
  tag,
  isOwner = false,
  onOverride,
}: CaseTagProps) {
  const t = useT();

  const colors = CATEGORY_COLORS[tag.category] ?? {
    bg: "bg-white/10",
    text: "text-sindicato-warm-white/60",
    border: "border-white/20",
  };

  const i18nKey = TAG_I18N_MAP[tag.tagName];
  const displayName = i18nKey ? t(i18nKey) : tag.tagName;

  const isRejected = tag.workerOverride === "rejected";
  const isConfirmed = tag.workerOverride === "confirmed";

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border transition-colors cursor-default",
                colors.bg,
                colors.text,
                colors.border,
                isRejected && "opacity-40 line-through",
                isConfirmed && "ring-1 ring-emerald-500/30"
              )}
            />
          }
        >
          {displayName}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={8}
          className="bg-sindicato-charcoal border border-white/20 text-sindicato-warm-white max-w-xs p-3"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  colors.text
                )}
              >
                {displayName}
              </span>
              <span className="text-[10px] text-sindicato-warm-white/40 font-mono shrink-0">
                {tag.confidence}%
              </span>
            </div>

            {tag.sourceText && (
              <p className="text-[11px] text-sindicato-warm-white/50 leading-relaxed italic">
                &ldquo;{tag.sourceText}&rdquo;
              </p>
            )}

            {isOwner && !isConfirmed && !isRejected && (
              <div className="flex gap-1.5 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOverride?.(tag.id, "confirmed");
                  }}
                  className="text-[10px] px-2 py-0.5 border border-emerald-500/20 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors uppercase tracking-wider"
                >
                  <CheckIcon className="size-3 inline mr-0.5" />
                  {t("tags.workerConfirmed")}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOverride?.(tag.id, "rejected");
                  }}
                  className="text-[10px] px-2 py-0.5 border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider"
                >
                  <XIcon className="size-3 inline mr-0.5" />
                  {t("tags.workerRejected")}
                </button>
              </div>
            )}

            {isConfirmed && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                <CheckIcon className="size-3" />
                {t("tags.workerConfirmed")}
              </span>
            )}
            {isRejected && (
              <span className="inline-flex items-center gap-1 text-[10px] text-red-400">
                <XIcon className="size-3" />
                {t("tags.workerRejected")}
              </span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
