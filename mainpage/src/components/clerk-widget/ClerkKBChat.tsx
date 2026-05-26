"use client";

import { useState, useCallback, useRef } from "react";
import { ArrowUp } from "lucide-react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { useClerkWidget } from "./ClerkWidgetProvider";

const KB_WELCOME: string =
  "Ask me anything about Sindicato — what it is, how it works, why it exists, or how to use the platform.";

const KB_SUGGESTIONS = [
  "What is Sindicato?",
  "How do I file a case?",
  "Who can access the data?",
  "How is my privacy protected?",
  "What is the manifesto about?",
];

export function ClerkKBChat() {
  const { messages, addMessage, updateLastMessage } = useClerkWidget();
  const modeMessages = messages["kb-chat"];

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user" as const, content: input };
    addMessage("kb-chat", userMsg);
    addMessage("kb-chat", { role: "assistant", content: "" });

    const question = input;
    setInput("");
    setIsLoading(true);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/clerk/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("KB request failed");

      const data = await res.json();
      updateLastMessage("kb-chat", data.answer || "I couldn't find an answer to that. Try contacting Sindicato directly.");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        updateLastMessage("kb-chat", "Sorry, I couldn't process that right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [input, isLoading, addMessage, updateLastMessage]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        {modeMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6">
            <p className="text-sm text-sindicato-warm-white/60 text-center mb-4">
              {KB_WELCOME}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {KB_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-sindicato-warm-white/60 hover:text-sindicato-warm-white hover:bg-white/10 transition-all hover:-translate-y-0.5 border border-white/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ChatContainerRoot className="h-full">
            <ChatContainerContent className="pt-3">
              {modeMessages.map((msg, i) =>
                msg.role === "user" ? (
                  <Message key={i} className="mb-3 justify-end items-center">
                    <MessageContent className="bg-sindicato-cream text-sindicato-charcoal rounded-3xl px-4 py-2.5 max-w-[85%] text-sm shadow-md shadow-black/10">
                      {msg.content}
                    </MessageContent>
                    <MessageAvatar
                      src="/clerk-avatar.png"
                      alt="You"
                      fallback="👤"
                      className="ml-2 size-[54px] border-2 border-black bg-sindicato-pine"
                    />
                  </Message>
                ) : isLoading && i === modeMessages.length - 1 && !msg.content ? (
                  <Message key={i} className="mb-3 items-center">
                    <MessageAvatar
                      src="/clerk.png"
                      alt="Clerk"
                      fallback="🤖"
                      className="mr-2 size-[54px] border-2 border-black bg-sindicato-bordeaux"
                    />
                    <div className="ml-2 px-4 py-2.5 rounded-3xl bg-sindicato-smoked-charcoal/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
                      <TextShimmer className="text-xs text-sindicato-warm-white">
                        Thinking
                      </TextShimmer>
                    </div>
                  </Message>
                ) : (
                  <Message key={i} className="mb-3 items-center">
                    <MessageAvatar
                      src="/clerk.png"
                      alt="Clerk"
                      fallback="🤖"
                      className="mr-2 size-[54px] border-2 border-black bg-sindicato-bordeaux"
                    />
                    <MessageContent
                      className="ml-2 rounded-3xl px-4 py-2.5 text-sm text-sindicato-warm-white bg-sindicato-smoked-charcoal/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 max-w-[85%]"
                      markdown={true}
                    >
                      {msg.content}
                    </MessageContent>
                  </Message>
                )
              )}
              <ChatContainerScrollAnchor />
            </ChatContainerContent>
          </ChatContainerRoot>
        )}
      </div>

      <div className="border-t border-white/5 bg-sindicato-smoked-charcoal/60 backdrop-blur-2xl px-3 py-2.5">
        <PromptInput
          value={input}
          onValueChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full bg-white/5 border-white/10 shadow-xl shadow-black/20 p-1.5"
        >
          <div className="flex items-center gap-2">
            <PromptInputTextarea
              placeholder="Ask about Sindicato..."
              className="text-sindicato-warm-white/90 placeholder:text-sindicato-warm-white/30 flex-1 text-sm"
              disableAutosize
            />
            <PromptInputActions className="shrink-0">
              <PromptInputAction>
                <Button
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  onClick={handleSubmit}
                  className="size-8 rounded-full bg-sindicato-cream text-sindicato-charcoal hover:bg-sindicato-cream/90"
                >
                  <ArrowUp size={16} />
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </div>
        </PromptInput>
      </div>
    </div>
  );
}
