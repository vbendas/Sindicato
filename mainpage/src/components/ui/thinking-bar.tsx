"use client"

import { cn } from "@/lib/utils"
import { ChevronRight, Loader2 } from "lucide-react"

type ThinkingBarProps = {
  className?: string
  text?: string
  onStop?: () => void
  stopLabel?: string
  onClick?: () => void
}

export function ThinkingBar({
  className,
  text = "Analyzing data",
  onStop,
  stopLabel = "Answer now",
  onClick,
}: ThinkingBarProps) {
  return (
    <div className={cn("flex w-full items-center justify-between gap-3", className)}>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-80 text-sindicato-warm-white"
        >
          <Loader2 className="size-4 animate-spin text-sindicato-warm-white/70" />
          <span className="font-medium">{text}</span>
          <ChevronRight className="text-sindicato-warm-white/50 size-4" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-sindicato-warm-white/70" />
          <span className="font-medium text-sindicato-warm-white">{text}</span>
        </div>
      )}
      {onStop ? (
        <button
          onClick={onStop}
          type="button"
          className="text-sindicato-warm-white/50 hover:text-sindicato-warm-white border-white/30 hover:border-white border-b border-dotted text-sm transition-colors"
        >
          {stopLabel}
        </button>
      ) : null}
    </div>
  )
}
