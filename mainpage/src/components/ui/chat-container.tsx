"use client"

import { cn } from "@/lib/utils"
import { StickToBottom } from "use-stick-to-bottom"
import { createContext, useContext, useEffect, useState } from "react"

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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <ChatContainerContext.Provider value={false}>
        <div className={cn("flex overflow-y-auto", className)} {...props}>
          {children}
        </div>
      </ChatContainerContext.Provider>
    )
  }

  return (
    <ChatContainerContext.Provider value={true}>
      <StickToBottom
        className={cn("flex overflow-y-auto", className)}
        resize="smooth"
        initial="instant"
        role="log"
        {...props}
      >
        {children}
      </StickToBottom>
    </ChatContainerContext.Provider>
  )
}

function ChatContainerContent({
  children,
  className,
  ...props
}: ChatContainerContentProps) {
  const isMounted = useContext(ChatContainerContext)

  if (!isMounted) {
    return (
      <div className={cn("flex w-full flex-col", className)} {...props}>
        {children}
      </div>
    )
  }

  return (
    <StickToBottom.Content
      className={cn("flex w-full flex-col", className)}
      {...props}
    >
      {children}
    </StickToBottom.Content>
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
