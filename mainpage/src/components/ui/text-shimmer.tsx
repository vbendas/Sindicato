"use client"

import { cn } from "@/lib/utils"

export type TextShimmerProps = {
  as?: string
  duration?: number
  spread?: number
  children: React.ReactNode
} & React.HTMLAttributes<HTMLElement>

export function TextShimmer({
  as = "span",
  className,
  duration = 2,
  spread = 20,
  children,
  ...props
}: TextShimmerProps) {
  const dynamicSpread = Math.min(Math.max(spread, 5), 45)
  const Component = as as React.ElementType

  return (
    <Component
      className={cn(
        "font-medium text-shimmer",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.3) ${50 - dynamicSpread}%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.3) ${50 + dynamicSpread}%)`,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        animationName: "shimmer",
        animationDuration: `${duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
      }}
      {...props}
    >
      {children}
    </Component>
  )
}
