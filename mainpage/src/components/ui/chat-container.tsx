"use client"

import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { createContext, useContext } from "react"

const StickToBottom = dynamic(
  () => import("use-stick-to-bottom").then((mod) => mod.StickToBottom),
  { ssr: false }
)

const StickToBottomContent = dynamic(
  () => import("use-stick-to-bottom").then((mod) => mod.StickToBottom.Content),
  { ssr: false }
)

const ChatContainerContext = createContext(false)

export type ChatContainerRootProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export type ChatContainerContentProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export type ChatContainerScrollAnchorProps = {
  className?: string
  ref?: React.RefObject<HTMLDivElement>
} & React.HTMLAttributes<HTMLDivElement>

function ChatContainerRoot({
  children,
  className,
  ...props
}: ChatContainerRootProps) {
  return (
    <ChatContainerContext.Provider value={true}>
      {typeof window === "undefined" ? (
        <div className={cn("flex overflow-y-auto", className)} {...props}>
          {children}
        </div>
      ) : (
        <StickToBottom
          className={cn("flex overflow-y-auto", className)}
          resize="smooth"
          initial="instant"
          role="log"
          {...props}
        >
          {children}
        </StickToBottom>
      )}
    </ChatContainerContext.Provider>
  )
}

function ChatContainerContent({
  children,
  className,
  ...props
}: ChatContainerContentProps) {
  const isMounted = useContext(ChatContainerContext)

  if (!isMounted || typeof window === "undefined") {
    return (
      <div className={cn("flex w-full flex-col", className)} {...props}>
        {children}
      </div>
    )
  }

  return (
    <StickToBottomContent
      className={cn("flex w-full flex-col", className)}
      {...props}
    >
      {children}
    </StickToBottomContent>
  )
}

function ChatContainerScrollAnchor({
  className,
  ...props
}: ChatContainerScrollAnchorProps) {
  return (
    <div
      className={cn("h-px w-full shrink-0 scroll-mt-4", className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor }
