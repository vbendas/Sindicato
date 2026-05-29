"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowUp, Database, Download, Sparkles } from "lucide-react";
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
import SuggestionPanel from "@/app/[lang]/clerk/components/SuggestionPanel";
import VariableChipBar from "@/app/[lang]/clerk/components/VariableChipBar";
import {
  getSuggestionGroups,
  filterSuggestions,
  getTemplateDefinition,
} from "@/app/[lang]/clerk/components/suggestions";
import type { SuggestionItem, Variables } from "@/app/[lang]/clerk/components/suggestions";
import type { TemplateVariable } from "@/app/[lang]/clerk/prompts";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/lib/i18n";
import { ClerkChart } from "@/components/clerk/ClerkChart";

export function ClerkQueryChat() {
  const {
    messages,
    addMessage,
    updateLastMessage,
    session,
    pendingQuery,
    setPendingQuery,
  } = useClerkWidget();
  const { locale } = useLocale();
  const t = useT();
  const modeMessages = messages["query-chat"];

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [variablesData, setVariablesData] = useState<Variables | null>(null);
  const [activeVars, setActiveVars] = useState<TemplateVariable[]>([]);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [varLabels, setVarLabels] = useState<Record<string, string>>({});

  const abortRef = useRef<AbortController | null>(null);
  const justSubmittedRef = useRef(false);
  const autoSubmitOnResolveRef = useRef(false);
  const handleSubmitRef = useRef<(msg?: string) => Promise<void>>(async () => {});

  const userRole = session?.user?.role ?? null;
  const suggestionGroups = getSuggestionGroups(userRole);

  useEffect(() => {
    fetch("/api/clerk/variables")
      .then((r) => r.json())
      .then((d) => setVariablesData(d.data))
      .catch(() => {});
  }, []);

  const hasUnresolvedVars =
    activeVars.length > 0 && activeVars.some((v) => !varValues[v.name]);
  const sendDisabled = !input.trim() || isLoading || hasUnresolvedVars;

  const handleSuggestionSelect = useCallback(
    async (suggestion: SuggestionItem) => {
      setInput(suggestion.template);
      setShowSuggestions(false);
      setVarValues({});
      setVarLabels({});

      let currentSession = session;
      try {
        const response = await fetch("/api/auth/session");
        const freshSession = await response.json();
        currentSession = freshSession?.user ? freshSession : null;
      } catch {}

      if (suggestion.templatePromptId) {
        const def = getTemplateDefinition(suggestion.templatePromptId);
        if (def) {
          const companyVar = def.variables.find((v) => v.name === "company");
          if (
            companyVar &&
            userRole === "company" &&
            currentSession?.user?.companyName
          ) {
            const resolved = suggestion.template.replace(
              `{${companyVar.name}}`,
              currentSession.user.companyName
            );
            setInput(resolved);
            setVarValues({ company: currentSession.user.companyName });
            setVarLabels({ company: currentSession.user.companyName });
            const filtered = def.variables.filter((v) => v.name !== "company");
            setActiveVars(filtered);
            if (filtered.length > 0) {
              autoSubmitOnResolveRef.current = true;
            } else {
              handleSubmitRef.current(resolved);
            }
            return;
          }
          setActiveVars(def.variables);
          if (def.variables.length > 0) {
            autoSubmitOnResolveRef.current = true;
          } else {
            handleSubmitRef.current(suggestion.template);
          }
        } else {
          setActiveVars([]);
          handleSubmitRef.current(suggestion.template);
        }
      } else {
        setActiveVars([]);
        handleSubmitRef.current(suggestion.template);
      }
    },
    [userRole, session]
  );

  const handleVariableChange = useCallback(
    (name: string, value: string, label: string) => {
      setVarValues((prev) => ({ ...prev, [name]: value }));
      setVarLabels((prev) => ({ ...prev, [name]: label }));
      setInput((prev) => prev.replace(`{${name}}`, label));
    },
    []
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      if (activeVars.length > 0) {
        const stillPresent = activeVars.filter((v) =>
          value.includes(`{${v.name}}`)
        );
        if (stillPresent.length !== activeVars.length) {
          setActiveVars(stillPresent);
          if (stillPresent.length === 0) {
            setVarValues({});
            setVarLabels({});
          }
        }
      }
    },
    [activeVars]
  );

  const handleSubmit = useCallback(async (overrideMessage?: string) => {
    const messageToSend = overrideMessage ?? input;
    if (!messageToSend.trim() || isLoading) return;

    justSubmittedRef.current = true;
    setTimeout(() => {
      justSubmittedRef.current = false;
    }, 500);

    if (abortRef.current) abortRef.current.abort();

    addMessage("query-chat", { role: "user", content: messageToSend });
    addMessage("query-chat", { role: "assistant", content: "" });

    const currentInput = messageToSend;
    const currentHistory = modeMessages;
    setInput("");
    setIsLoading(true);
    setShowShimmer(true);
    setShowSuggestions(false);
    setVarValues({});
    setVarLabels({});
    setActiveVars([]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch("/api/clerk/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Response-Mode": "concise",
        },
        body: JSON.stringify({
          message: currentInput,
          history: currentHistory,
          locale,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("API request failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantMessage = "";
      let queryResults = "";
      let firstChunkReceived = false;
      let rawResultsComplete = false;
      let buffer = "";
      let hasMarkers = true;
      let chunkCount = 0;
      const MAX_BUFFER_CHUNKS = 5;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          chunkCount++;

          if (!firstChunkReceived) {
            firstChunkReceived = true;
            setTimeout(() => setShowShimmer(false), 1000);
            if (!chunk.includes("__RAW_RESULTS__")) {
              hasMarkers = false;
            }
          }

          if (!hasMarkers) {
            assistantMessage += chunk;
            updateLastMessage("query-chat", assistantMessage);
            continue;
          }

          if (!rawResultsComplete) {
            buffer += chunk;
            const startMarker = "__RAW_RESULTS__";
            const endMarker = "__END_RAW_RESULTS__";

            if (chunkCount > MAX_BUFFER_CHUNKS && !buffer.includes(startMarker)) {
              hasMarkers = false;
              assistantMessage = buffer;
              buffer = "";
              updateLastMessage("query-chat", assistantMessage);
              continue;
            }

            if (buffer.includes(startMarker) && buffer.includes(endMarker)) {
              try {
                const startIndex =
                  buffer.indexOf(startMarker) + startMarker.length;
                const endIndex = buffer.indexOf(endMarker);
                queryResults = buffer.substring(startIndex, endIndex);
                const remaining = buffer.substring(
                  endIndex + endMarker.length
                );
                assistantMessage = remaining;
                buffer = "";
                rawResultsComplete = true;
              } catch {
                hasMarkers = false;
                assistantMessage = buffer;
                buffer = "";
              }
            } else {
              continue;
            }
          } else {
            assistantMessage += chunk;
          }

          updateLastMessage(
            "query-chat",
            assistantMessage,
            queryResults || undefined
          );
        }

        if (!rawResultsComplete && buffer.length > 0) {
          assistantMessage = buffer;
          updateLastMessage("query-chat", assistantMessage);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          updateLastMessage(
            "query-chat",
            "I apologize, but I encountered an error processing your request. Please try again."
          );
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        updateLastMessage("query-chat", "Request was canceled.");
      } else {
        updateLastMessage(
          "query-chat",
          "An error occurred while processing your request. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
      setShowShimmer(false);
      abortRef.current = null;
    }
  }, [
    input,
    isLoading,
    modeMessages,
    addMessage,
    updateLastMessage,
  ]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  useEffect(() => {
    if (pendingQuery) {
      const msg = pendingQuery;
      setPendingQuery(null);
      requestAnimationFrame(() => handleSubmitRef.current(msg));
    }
  }, [pendingQuery, setPendingQuery]);

  useEffect(() => {
    if (
      autoSubmitOnResolveRef.current &&
      activeVars.length > 0 &&
      !activeVars.some((v) => !varValues[v.name]) &&
      input.trim() &&
      !isLoading
    ) {
      autoSubmitOnResolveRef.current = false;
      requestAnimationFrame(() => handleSubmitRef.current());
    }
  }, [varValues, activeVars, input, isLoading]);

  const handleDownloadMarkdown = (content: string, index: number) => {
    const date = new Date().toISOString().split("T")[0];
    const message = modeMessages[index];
    let fullContent = content;

    setIsDownloading(true);

    if (message.queryResults) {
      try {
        const results = JSON.parse(message.queryResults);
        if (results.rows && results.rows.length > 0) {
          fullContent += "\n\n---\n\n## Full Case Details\n\n";
          fullContent += `*This report contains ${results.rows.length} cases with complete stories.*\n\n`;
          results.rows.forEach((row: Record<string, string | number | null>, idx: number) => {
            fullContent += `### Case ${idx + 1}: ${row.id}\n\n`;
            fullContent += `**Company:** ${row.companyName}\n\n`;
            fullContent += `**Country:** ${row.country}\n\n`;
            fullContent += `**Case Type:** ${row.caseType}\n\n`;
            fullContent += `**Amount Owed:** ${row.currency} ${row.amountOwed}\n\n`;
            fullContent += `**Date Range:** ${row.dateRange}\n\n`;
            fullContent += `**Status:** ${row.resolutionStatus}\n\n`;
            if (row.contactAlias) {
              fullContent += `**Contact Email:** ${row.contactAlias}\n\n`;
            }
            if (row.story) {
              fullContent += `**Full Story:**\n\n${row.story}\n\n`;
            }
            fullContent += "---\n\n";
          });
        }
      } catch {
        alert(
          "Unable to download full case details. Please try running the query again."
        );
        setIsDownloading(false);
        return;
      }
    }

    const md = `# Sindicato Data Report\n\nGenerated: ${date}\n\n---\n\n${fullContent}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sindicato-report-${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  const filteredGroups = filterSuggestions(suggestionGroups, input);
  const panelVisible =
    showSuggestions && filteredGroups.some((g) => g.suggestions.length > 0);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        {modeMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Database size={20} className="text-sindicato-warm-white/30" />
            </div>
            <p className="text-sm text-sindicato-warm-white/60 text-center mb-2 leading-relaxed">
              Query the Sindicato database. Ask about cases, companies, violations, or trends.
            </p>
            <p className="text-xs text-sindicato-warm-white/30 text-center">
              Responses are summarized. Download .md reports for full details.
            </p>
          </div>
        ) : (
          <ChatContainerRoot className="h-full">
            <ChatContainerContent className="pt-3">
              {modeMessages.map((msg, index) =>
                msg.role === "user" ? (
                  <Message key={index} className="mb-3 justify-end">
                    <MessageContent className="bg-sindicato-cream text-sindicato-charcoal rounded-3xl px-4 py-2.5 max-w-[85%] text-sm shadow-md shadow-black/10">
                      {msg.content}
                    </MessageContent>
                    <MessageAvatar
                      src="/clerk-avatar.png"
                      alt="You"
                      fallback="👤"
                      className="ml-2 size-6 border-2 border-black bg-sindicato-pine"
                    />
                  </Message>
                ) : isLoading &&
                  index === modeMessages.length - 1 &&
                  (!msg.content || showShimmer) ? (
                  <Message key={index} className="mb-3">
                    <MessageAvatar
                      src="/clerk.png"
                      alt={t("clerk.name")}
                      fallback="🤖"
                      className="mr-2 size-6 border-2 border-black bg-sindicato-bordeaux"
                    />
                    <div className="ml-2 px-4 py-2.5 rounded-3xl bg-sindicato-smoked-charcoal/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
                      <TextShimmer className="text-xs text-sindicato-warm-white">
                        Analyzing data
                      </TextShimmer>
                    </div>
                  </Message>
                ) : (
                  <Message key={index} className="mb-3">
                    <MessageAvatar
                      src="/clerk.png"
                      alt={t("clerk.name")}
                      fallback="🤖"
                      className="mr-2 size-6 border-2 border-black bg-sindicato-bordeaux"
                    />
                    <div className="flex flex-col max-w-[85%]">
                      <MessageContent
                        className={cn(
                          "ml-2 rounded-3xl px-4 py-2.5 text-sm text-sindicato-warm-white bg-sindicato-smoked-charcoal/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20",
                          msg.content.includes(
                            "can only answer questions about"
                          )
                            ? "bg-red-500/20 border-red-500/30"
                            : ""
                        )}
                        markdown={true}
                      >
                        {msg.content}
                      </MessageContent>
                      {msg.content &&
                        !msg.content.includes("can only answer") &&
                        !msg.content.includes("Request was canceled") &&
                        !msg.content.includes("An error occurred") &&
                        msg.queryResults && (
                          <ClerkChart
                            queryResults={msg.queryResults}
                            compact={true}
                            className="ml-2 mt-2"
                          />
                        )}
                      {msg.content &&
                        !msg.content.includes("can only answer") &&
                        !msg.content.includes("Request was canceled") &&
                        !msg.content.includes("An error occurred") &&
                        msg.queryResults && (
                          <button
                            onClick={() =>
                              handleDownloadMarkdown(msg.content, index)
                            }
                            disabled={isDownloading}
                            className="ml-2 mt-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-sindicato-bordeaux/20 text-sindicato-warm-white/70 hover:text-sindicato-warm-white hover:bg-sindicato-bordeaux/30 disabled:opacity-50 transition-all self-start border border-sindicato-bordeaux/20"
                          >
                            {isDownloading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-sindicato-warm-white/30 border-t-sindicato-warm-white rounded-full animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download size={11} />
                                Download full report (.md)
                              </>
                            )}
                          </button>
                        )}
                    </div>
                  </Message>
                )
              )}
              <ChatContainerScrollAnchor />
            </ChatContainerContent>
          </ChatContainerRoot>
        )}
      </div>

      <div className="border-t border-white/5 bg-sindicato-smoked-charcoal/60 backdrop-blur-2xl">
        <div className="relative px-3 pt-1.5 pb-2.5">
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
            onSubmit={() => handleSubmit()}
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full bg-white/5 border-white/10 shadow-xl shadow-black/20 p-1.5"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="size-7 rounded-full flex items-center justify-center text-sindicato-warm-white/40 hover:text-sindicato-warm-white hover:bg-white/10 transition-colors shrink-0"
                title="Suggestions"
              >
                <Sparkles size={14} />
              </button>
              <PromptInputTextarea
                placeholder="Query the data..."
                className="text-sindicato-warm-white/90 placeholder:text-sindicato-warm-white/30 flex-1 text-sm"
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
                    onClick={() => handleSubmit()}
                    className="size-8 rounded-full bg-sindicato-cream text-sindicato-charcoal hover:bg-sindicato-cream/90"
                  >
                    <ArrowUp size={16} />
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
    </div>
  );
}
