"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowUp, Database, Sparkles } from "lucide-react";
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
import SuggestionPanel from "@/app/[lang]/clerk/components/SuggestionPanel";
import VariableChipBar from "@/app/[lang]/clerk/components/VariableChipBar";
import {
  getSuggestionGroups,
  filterSuggestions,
  getTemplateDefinition,
} from "@/app/[lang]/clerk/components/suggestions";
import type { SuggestionItem, Variables } from "@/app/[lang]/clerk/components/suggestions";
import type { TemplateVariable } from "@/app/[lang]/clerk/prompts";
import { useLocale, useT } from "@/lib/i18n";
import { ClerkMessageRenderer } from "@/components/clerk/ClerkMessageRenderer";
import type { ChartLabels } from "@/components/clerk/ClerkChart";
import {
  createStreamParseState,
  processStreamChunk,
  finalizeStreamParse,
} from "@/lib/clerk/parse-stream";
import {
  buildMarkdownReport,
  downloadMarkdown,
} from "@/lib/clerk/download";
import { useClerkWidget } from "./ClerkWidgetProvider";

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
  const suggestionGroups = getSuggestionGroups(userRole, t);

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
      const state = createStreamParseState();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const result = processStreamChunk(state, chunk);

          if (state.firstChunkReceived) {
            setTimeout(() => setShowShimmer(false), 1000);
          }

          if (result.assistantMessage || result.queryResults || state.firstChunkReceived) {
            updateLastMessage(
              "query-chat",
              result.assistantMessage,
              result.queryResults || undefined
            );
          }
        }

        const final = finalizeStreamParse(state);
        updateLastMessage(
          "query-chat",
          final.assistantMessage,
          final.queryResults || undefined
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          updateLastMessage(
            "query-chat",
            t("clerk.query.errorProcessing")
          );
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        updateLastMessage("query-chat", t("clerk.query.canceled"));
      } else {
        updateLastMessage(
          "query-chat",
          t("clerk.query.errorGeneric")
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
    setIsDownloading(true);
    const date = new Date().toISOString().split("T")[0];
    const message = modeMessages[index];

    const { markdown, ok } = buildMarkdownReport({
      content,
      queryResultsJson: message.queryResults,
      reportTitle: t("clerk.query.reportTitle"),
      reportFullCases: t("clerk.query.reportFullCases"),
      reportCasesCountTemplate: t("clerk.query.reportCasesCount"),
      reportCompany: t("clerk.query.reportCompany"),
      reportCountry: t("clerk.query.reportCountry"),
      reportCaseType: t("clerk.query.reportCaseType"),
      reportAmount: t("clerk.query.reportAmount"),
      reportDateRange: t("clerk.query.reportDateRange"),
      reportStatus: t("clerk.query.reportStatus"),
      reportContact: t("clerk.query.reportContact"),
      reportStory: t("clerk.query.reportStory"),
      downloadError: t("clerk.query.downloadError"),
      onParseError: () => alert(t("clerk.query.downloadError")),
    });

    if (!ok) {
      setIsDownloading(false);
      return;
    }

    downloadMarkdown(`sindicato-report-${date}.md`, markdown);
    setIsDownloading(false);
  };

  const chartLabels: ChartLabels = {
    title: t("clerk.chart.title"),
    total: t("clerk.chart.total"),
    tooltipCount: t("clerk.chart.tooltipCount"),
    statCount: t("clerk.chart.statCount"),
    statTotalUnpaid: t("clerk.chart.statTotalUnpaid"),
    statSum: t("clerk.chart.statSum"),
    statRecords: t("clerk.chart.statRecords"),
    statViews: t("clerk.chart.statViews"),
    statVisitors: t("clerk.chart.statVisitors"),
    statShares: t("clerk.chart.statShares"),
    autoDimension: t("clerk.chart.autoDimension"),
    noData: t("clerk.chart.noData"),
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
              {t("clerk.query.welcome1")}
            </p>
            <p className="text-xs text-sindicato-warm-white/30 text-center">
              {t("clerk.query.welcome2")}
            </p>
          </div>
        ) : (
          <ChatContainerRoot className="h-full">
            <ChatContainerContent className="pt-3">
              {modeMessages.map((msg, index) => (
                <ClerkMessageRenderer
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  queryResults={msg.queryResults}
                  isLoading={isLoading}
                  isLast={index === modeMessages.length - 1}
                  showShimmer={showShimmer}
                  compact
                  index={index}
                  isDownloading={isDownloading}
                  onDownload={handleDownloadMarkdown}
                  chartLabels={chartLabels}
                />
              ))}
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
                title={t("clerk.query.titleSuggestions")}
              >
                <Sparkles size={14} />
              </button>
              <PromptInputTextarea
                placeholder={t("clerk.query.placeholder")}
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
