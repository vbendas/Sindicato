"use client";

import { useT, useLocale } from "@/lib/i18n";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { CheckIcon, XIcon } from "lucide-react";
import { getTagSeverity, type TagSeverity } from "@/lib/ai/tag-taxonomy";

const SEVERITY_COLORS: Record<
  TagSeverity,
  { bg: string; text: string; border: string }
> = {
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  yellow: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
  },
  red: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
};

export interface CaseTagData {
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

interface CaseTagProps {
  tag: CaseTagData;
  isOwner?: boolean;
  onOverride?: (
    tagId: string,
    override: "confirmed" | "rejected"
  ) => void;
  onDelete?: (tagId: string) => void;
}

export const TAG_I18N_MAP: Record<string, string> = {
  "Retroactive term change": "tags.retroactive_term_change",
  "Pay structure concerns reported": "tags.deceptive_pay_practices",
  "Payment cap / limit": "tags.payment_cap_limit",
  "No feedback provided": "tags.no_feedback_provided",
  "Undefined quality standard": "tags.undefined_quality_standard",
  "Quality raised after dispute": "tags.post_hoc_quality_claim",
  "Tasks removed / deleted": "tags.tasks_removed_deleted",
  "Ignored messages": "tags.ignored_messages",
  "Communication access restricted": "tags.channel_lockout",
  "Support deflection": "tags.support_deflection",
  "Alias management": "tags.alias_management",
  "Project paused / ended abruptly": "tags.project_paused_ended",
  "Project deleted from dashboard": "tags.project_deleted_dashboard",
  "Task allocation dropped": "tags.task_allocation_dropped",
  "Forced exit reported": "tags.constructive_termination",
  "Retaliation reported": "tags.retaliation",
  "DLSE filing indicated": "tags.dlse_filing_indicated",
  "Legal counsel sought": "tags.legal_counsel_sought",
  "Open to legal representation": "tags.open_to_legal",
  "Collective action interest": "tags.collective_action_interest",
  "Public documentation": "tags.public_documentation",
  "Company reached out proactively": "tags.company_proactive_outreach",
  "Company provided relevant response": "tags.company_relevant_response",
  "Company resolved the issue": "tags.company_resolved",
  "Company responded quickly": "tags.company_quick_response",
};

const SOURCE_LABELS: Record<string, string> = {
  ai: "tags.source.ai",
  user: "tags.source.user",
  auto: "tags.source.auto",
};

export function CaseTag({
  tag,
  isOwner = false,
  onOverride,
  onDelete,
}: CaseTagProps) {
  const t = useT();
  const { locale } = useLocale();

  const severity = getTagSeverity(tag.tagName);
  const colors = SEVERITY_COLORS[severity];

  const i18nKey = TAG_I18N_MAP[tag.tagName];
  const displayName = i18nKey ? t(i18nKey) : tag.tagName;

  const isRejected = tag.workerOverride === "rejected";
  const isConfirmed = tag.workerOverride === "confirmed";
  const isUserTag = tag.source === "user";

  const sourceI18nKey = SOURCE_LABELS[tag.source];
  const sourceLabel = sourceI18nKey ? t(sourceI18nKey) : tag.source;

  const needsSourceTranslation =
    locale !== "en" && Boolean(tag.sourceText);

  const { displayText: translatedSourceText, isTranslating: isSourceTranslating } = useTranslation(
    tag.sourceText,
    "en",
    needsSourceTranslation,
  );

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

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[9px] uppercase tracking-wider px-1.5 py-0.5 border",
                  tag.source === "ai"
                    ? "text-sky-400/70 border-sky-500/20 bg-sky-500/5"
                    : tag.source === "user"
                    ? "text-emerald-400/70 border-emerald-500/20 bg-emerald-500/5"
                    : "text-amber-400/70 border-amber-500/20 bg-amber-500/5"
                )}
              >
                {sourceLabel}
              </span>
            </div>

            {tag.sourceText && (
              <p className="text-[11px] text-sindicato-warm-white/50 leading-relaxed italic">
                {isSourceTranslating ? (
                  <span className="flex items-center gap-1.5 not-italic">
                    <span className="w-2.5 h-2.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                    <span className="text-blue-400 text-[9px] uppercase tracking-wider font-[family-name:var(--font-jetbrains)]">
                      {t("common.translating")}
                    </span>
                  </span>
                ) : (
                  <>&ldquo;{translatedSourceText}&rdquo;</>
                )}
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
                {isUserTag && onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(tag.id);
                    }}
                    className="text-[10px] px-2 py-0.5 border border-white/20 text-sindicato-warm-white/50 hover:text-sindicato-warm-white hover:bg-white/10 transition-colors uppercase tracking-wider"
                  >
                    {t("tags.removeTag")}
                  </button>
                )}
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
