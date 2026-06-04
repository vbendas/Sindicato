"use client";

import { Download } from "lucide-react";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { ClerkChart, type ChartLabels } from "@/components/clerk/ClerkChart";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const REJECTION_FRAGMENT = "can only answer questions about";

type ClerkMessageRendererProps = {
  role: "user" | "assistant";
  content: string;
  queryResults?: string;
  isLoading?: boolean;
  isLast?: boolean;
  showShimmer?: boolean;
  compact?: boolean;
  index: number;
  isDownloading: boolean;
  onDownload?: (content: string, index: number) => void;
  chartLabels?: ChartLabels;
};

export function ClerkMessageRenderer({
  role,
  content,
  queryResults,
  isLoading = false,
  isLast = false,
  showShimmer = false,
  compact = false,
  index,
  isDownloading,
  onDownload,
  chartLabels,
}: ClerkMessageRendererProps) {
  const t = useT();

  if (role === "user") {
    return (
      <Message className={cn("mb-3 justify-end", compact ? "" : "mb-4")}>
        <MessageContent
          className={cn(
            "bg-sindicato-cream text-sindicato-charcoal rounded-3xl shadow-md shadow-black/10",
            compact ? "px-4 py-2.5 max-w-[85%] text-sm" : "px-5 py-3 max-w-[80%]"
          )}
        >
          {content}
        </MessageContent>
        <MessageAvatar
          src="/clerk-avatar.png"
          alt="You"
          fallback="👤"
          className={cn(
            "border-2 border-black bg-sindicato-pine",
            compact ? "ml-2 size-6" : "ml-3 size-20"
          )}
        />
      </Message>
    );
  }

  const isRejection = content.includes(REJECTION_FRAGMENT);
  const isCanceled = content.includes("Request was canceled");
  const isError = content.includes("An error occurred");
  const shouldShowChart =
    content && !isRejection && !isCanceled && !isError && !!queryResults;
  const shouldShowDownloadButton =
    content && !isRejection && !isCanceled && !isError && (compact
      ? !!queryResults
      : content.includes("|") || content.includes("- ") || !!queryResults);

  return (
    <Message className={cn("mb-3", !compact && "mb-4 items-center")}>
      <MessageAvatar
        src="/clerk.png"
        alt={t("clerk.name")}
        fallback="🤖"
        className={cn(
          "border-2 border-black bg-sindicato-bordeaux",
          compact ? "mr-2 size-6" : "mr-3 size-20"
        )}
      />
      {isLoading && isLast && (!content || showShimmer) ? (
        <div
          className={cn(
            "rounded-3xl bg-sindicato-smoked-charcoal/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20",
            compact ? "ml-2 px-4 py-2.5" : "ml-3 px-5 py-3 max-w-[80%] flex items-center"
          )}
        >
          <TextShimmer
            className={cn(
              "text-sindicato-warm-white",
              compact ? "text-xs" : "font-medium text-base"
            )}
          >
            {t(compact ? "clerk.query.analyzing" : "clerk.page.analyzing")}
          </TextShimmer>
        </div>
      ) : (
        <div className={cn("flex flex-col", compact ? "max-w-[85%]" : "max-w-[80%]")}>
          <MessageContent
            className={cn(
              "ml-2 rounded-3xl text-sindicato-warm-white bg-sindicato-smoked-charcoal/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20",
              compact ? "px-4 py-2.5 text-sm" : "ml-3 px-5 py-3",
              isRejection && "bg-red-500/20 border-red-500/30"
            )}
            markdown={true}
          >
            {content}
          </MessageContent>
          {shouldShowChart && (
            <ClerkChart
              queryResults={queryResults!}
              compact={compact}
              className={cn("mt-2", compact ? "ml-2" : "ml-3 mt-3")}
              labels={chartLabels}
            />
          )}
          {shouldShowDownloadButton && onDownload && (
            <button
              onClick={() => onDownload(content, index)}
              disabled={isDownloading}
              className={cn(
                "mt-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all self-start border",
                compact
                  ? "ml-2 bg-sindicato-bordeaux/20 text-sindicato-warm-white/70 hover:text-sindicato-warm-white hover:bg-sindicato-bordeaux/30 disabled:opacity-50 border-sindicato-bordeaux/20"
                  : "ml-3 mt-2 text-sindicato-warm-white/40 hover:text-sindicato-warm-white/70 disabled:text-sindicato-warm-white/20 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10 border-white/5"
              )}
            >
              {isDownloading ? (
                <>
                  <div className="w-3 h-3 border-2 border-sindicato-warm-white/30 border-t-sindicato-warm-white rounded-full animate-spin" />
                  {t(compact ? "clerk.query.generating" : "clerk.page.generating")}
                </>
              ) : (
                <>
                  <Download size={compact ? 11 : 12} />
                  {t(compact ? "clerk.query.downloadReport" : "clerk.page.downloadMd")}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </Message>
  );
}
