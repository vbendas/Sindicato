"use client"

import { TextShimmer } from "@/components/ui/text-shimmer"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

type ThinkingBarProps = {
  className?: string
  text?: string
  onStop?: () => void
  stopLabel?: string
  onClick?: () => void
}

export function ThinkingBar({
  className,
  text = "Thinking",
  onStop,
  stopLabel = "Answer now",
  onClick,
}: ThinkingBarProps) {
  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-1 text-sm transition-opacity hover:opacity-80 text-white"
        >
          <TextShimmer className="font-medium text-white">{text}</TextShimmer>
          <ChevronRight className="text-white/50 size-4" />
        </button>
      ) : (
        <TextShimmer className="cursor-default font-medium text-white">{text}</TextShimmer>
      )}
      {onStop ? (
        <button
          onClick={onStop}
          type="button"
          className="text-white/50 hover:text-white border-white/30 hover:border-white border-b border-dotted text-sm transition-colors"
        >
          {stopLabel}
        </button>
      ) : null}
    </div>
  )
}
