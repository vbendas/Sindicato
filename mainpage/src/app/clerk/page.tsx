"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/app/components/Header";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Download } from "lucide-react";
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "@/components/ui/chat-container";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import { ThinkingBar } from "@/components/ui/thinking-bar";
import SuggestionPanel from "./components/SuggestionPanel";
import VariableChipBar from "./components/VariableChipBar";
import WelcomeScreen from "./components/WelcomeScreen";
import { getSuggestionGroups, filterSuggestions, getTemplateDefinition } from "./components/suggestions";
import type { SuggestionItem, Variables } from "./components/suggestions";
import type { TemplateVariable } from "./prompts";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ClerkPage() {
  useEffect(() => {
    document.documentElement.classList.add("clerk-page");
    return () => document.documentElement.classList.remove("clerk-page");
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [variablesData, setVariablesData] = useState<Variables | null>(null);
  const [activeVars, setActiveVars] = useState<TemplateVariable[]>([]);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [varLabels, setVarLabels] = useState<Record<string, string>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const justSubmittedRef = useRef(false);
  const [showFullHeader, setShowFullHeader] = useState(true);
  const [session, setSession] = useState<{ user?: { role?: string; approvalStatus?: string; companyId?: string; companyName?: string } } | null>(null);

  const userRole = session?.user?.role ?? null;
  const approvalStatus = session?.user?.approvalStatus ?? null;
  const isPendingApproval = session && approvalStatus === "pending";
  const isRejected = session && approvalStatus === "rejected";
  const isApproved = session && approvalStatus === "approved";
  const isPrivileged = !!(session?.user?.role && approvalStatus === "approved");

  const suggestionGroups = getSuggestionGroups(userRole);

  useEffect(() => {
    fetch("/api/clerk/variables")
      .then((r) => r.json())
      .then((d) => setVariablesData(d.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setSession(s?.user ? s : null))
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSuggestions(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const hasUnresolvedVars = activeVars.length > 0 && activeVars.some((v) => !varValues[v.name]);
  const sendDisabled = !input.trim() || isLoading || hasUnresolvedVars;

  const handleSuggestionSelect = useCallback((suggestion: SuggestionItem) => {
    setInput(suggestion.template);
    setShowSuggestions(false);
    setVarValues({});
    setVarLabels({});

    if (suggestion.templatePromptId) {
      const def = getTemplateDefinition(suggestion.templatePromptId);
      if (def) {
        const companyVar = def.variables.find(v => v.name === "company");
        if (companyVar && userRole === "company" && session?.user?.companyName) {
          const resolved = suggestion.template.replace(`{${companyVar.name}}`, session.user.companyName);
          setInput(resolved);
          setVarValues({ company: session.user.companyName });
          setVarLabels({ company: session.user.companyName });
          const filtered = def.variables.filter(v => v.name !== "company");
          setActiveVars(filtered);
        } else {
          setActiveVars(def.variables);
        }
      } else {
        setActiveVars([]);
      }
    } else {
      setActiveVars([]);
    }
  }, [userRole, session]);

  const handleVariableChange = useCallback((name: string, value: string, label: string) => {
    setVarValues((prev) => ({ ...prev, [name]: value }));
    setVarLabels((prev) => ({ ...prev, [name]: label }));
    setInput((prev) => prev.replace(`{${name}}`, label));
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    if (activeVars.length > 0) {
      const stillPresent = activeVars.filter((v) => value.includes(`{${v.name}}`));
      if (stillPresent.length !== activeVars.length) {
        setActiveVars(stillPresent);
        if (stillPresent.length === 0) {
          setVarValues({});
          setVarLabels({});
        }
      }
    }
  }, [activeVars]);

  const handleSubmit = useCallback(async () => {
    if (sendDisabled) return;
    
    justSubmittedRef.current = true;
    setTimeout(() => { justSubmittedRef.current = false; }, 500);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Show minimal header after first message
    if (showFullHeader) {
      setShowFullHeader(false);
    }
    
    const userMessage = {
      role: "user" as const,
      content: input
    };
    
    // Add user message to the chat
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);
    setVarValues({});
    setVarLabels({});
    setActiveVars([]);

    try {
      // Create new abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Call the API with the conversation history
      const response = await fetch("/api/clerk/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: messages,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Read the stream response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Add an initial assistant message to be updated progressively
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;

          // Update the last message with the accumulated content
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantMessage };
            return updated;
          });
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        // User canceled the request
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: "assistant", 
            content: "Request was canceled." 
          };
          return updated;
        });
      } else {
        // Show error message
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: "assistant", 
            content: "An error occurred while processing your request. Please try again." 
          };
          return updated;
        });
        console.error("Error in clerk query:", error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, messages, sendDisabled, showFullHeader]);

  const handleDownloadMarkdown = (content: string, index: number) => {
    const date = new Date().toISOString().split("T")[0];
    const md = `# Sindicato Data Report\n\nGenerated: ${date}\n\n---\n\n${content}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sindicato-report-${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredGroups = filterSuggestions(suggestionGroups, input);
  const panelVisible = showSuggestions && filteredGroups.some((g) => g.suggestions.length > 0);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <Header
        scrolledBg={showFullHeader ? "bg-sindicato-smoked-charcoal border-white/10" : "bg-transparent border-transparent"}
        clerkBg={showFullHeader ? "bg-sindicato-bordeaux text-sindicato-warm-white" : "bg-transparent"}
        navTextColor={showFullHeader ? "text-sindicato-warm-white/70" : "text-sindicato-warm-white/70"}
        navHoverColor={showFullHeader ? "hover:text-sindicato-warm-white" : "hover:text-sindicato-warm-white"}
      />
      <main className="h-screen flex flex-col bg-sindicato-charcoal pt-16">
        {/* Chat area - fills remaining space */}
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col">
              {isPendingApproval && (
                <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-3 text-center">
                  <p className="text-yellow-400 text-sm">
                    Your account is pending approval. You can explore public data while you wait.
                    Contact information will be available once your account is approved.
                  </p>
                </div>
              )}
              {isRejected && (
                <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-3 text-center">
                  <p className="text-red-400 text-sm">
                    Your account request was not approved. You can still explore public data.
                  </p>
                </div>
              )}
              <div className="flex-1">
                <WelcomeScreen role={userRole} onSuggestionClick={(label) => {
                  const suggestionItem = suggestionGroups
                    .flatMap(g => g.suggestions)
                    .find(s => s.label === label);
                  if (suggestionItem) {
                    handleSuggestionSelect(suggestionItem);
                  }
                }} />
              </div>
            </div>
          ) : (
            <ChatContainerRoot className="h-full">
              <ChatContainerContent>
                {messages.map((msg, index) => (
                  msg.role === "user" ? (
                    <Message key={index} className="mb-4 justify-end">
                      <MessageContent className="bg-sindicato-cream text-sindicato-charcoal rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                        {msg.content}
                      </MessageContent>
                      <MessageAvatar src="/images/handfinal.png" alt="You" fallback="👤" className="ml-3" />
                    </Message>
                  ) : (
                    <Message key={index} className="mb-4">
                      <MessageAvatar src="/board-clerk.png" alt="Clerk AI" fallback="🤖" className="mr-3" />
                      {msg.content === "" && isLoading ? (
                        <div className="ml-3 flex items-center px-4 py-3 max-w-[80%]">
                          <ThinkingBar text="Analyzing data" />
                        </div>
                      ) : (
                        <div className="flex flex-col max-w-[80%]">
                          <MessageContent 
                            className={`ml-3 rounded-2xl rounded-tl-sm px-4 py-3 text-sindicato-warm-white bg-sindicato-smoked-charcoal border border-white/10 ${
                              msg.content.includes("can only answer questions about Sindicato's worker exploitation data") 
                                ? 'bg-red-500/20 border border-red-500/30' 
                                : ''
                            }`}
                            markdown={true}
                          >
                            {msg.content}
                          </MessageContent>
                          {msg.content && !msg.content.includes("can only answer") && !msg.content.includes("Request was canceled") && !msg.content.includes("An error occurred") && (
                            <button
                              onClick={() => handleDownloadMarkdown(msg.content, index)}
                              className="ml-3 mt-1 flex items-center gap-1 text-xs text-sindicato-warm-white/40 hover:text-sindicato-warm-white/70 transition-colors self-start"
                            >
                              <Download size={12} />
                              Download .md
                            </button>
                          )}
                        </div>
                      )}
                    </Message>
                  )
                ))}
                <ChatContainerScrollAnchor />
              </ChatContainerContent>
            </ChatContainerRoot>
          )}
        </div>
        
        {/* Input area - fixed at bottom */}
        <div className="border-t border-white/10 bg-sindicato-smoked-charcoal/95 backdrop-blur-sm">
          {!session && (
            <div className="px-4 pt-2 pb-0">
              <div className="border border-white/10 bg-white/5 px-4 py-2 text-center">
                <p className="text-xs text-sindicato-warm-white/50">
                  <Link href="/register?role=lawyer" className="underline hover:text-sindicato-warm-white">Legal professionals</Link>
                  {" · "}
                  <Link href="/register?role=company" className="underline hover:text-sindicato-warm-white">Companies</Link>
                  {" · "}
                  <Link href="/register?role=media" className="underline hover:text-sindicato-warm-white">Media &amp; research</Link>
                  {" — "}
                  <span className="text-sindicato-warm-white/40">Register for contact access</span>
                </p>
              </div>
            </div>
          )}
          <div className="relative px-4 pt-1 pb-2">
            {panelVisible && (
              <SuggestionPanel
                groups={filteredGroups}
                searchQuery={input}
                onSelect={handleSuggestionSelect}
                onClose={() => setShowSuggestions(false)}
              />
            )}
            <PromptInput
              value={input}
              onValueChange={handleInputChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full bg-sindicato-smoked-charcoal border-sindicato-smoked-charcoal shadow-lg p-2"
            >
              <div className="flex items-center gap-2">
                <PromptInputTextarea
                  placeholder="Ask anything about Sindicato's data..."
                  className="text-sindicato-warm-white/90 placeholder:text-sindicato-warm-white/30 flex-1 overflow-y-auto"
                  onFocus={() => {
                    if (!justSubmittedRef.current) setShowSuggestions(true);
                  }}
                  disableAutosize
                />

                <PromptInputActions className="shrink-0">
                  <PromptInputAction>
                    <Button
                      size="icon"
                      disabled={sendDisabled}
                      onClick={handleSubmit}
                      className="size-9 rounded-full bg-sindicato-cream text-sindicato-charcoal hover:bg-sindicato-cream/90"
                    >
                      <ArrowUp size={18} />
                    </Button>
                  </PromptInputAction>
                </PromptInputActions>
              </div>

              {activeVars.length > 0 && variablesData && (
                <VariableChipBar
                  variables={activeVars}
                  values={varValues}
                  labels={varLabels}
                  data={variablesData}
                  onChange={handleVariableChange}
                />
              )}
            </PromptInput>
          </div>
        </div>
      </main>
    </>
  );
}
