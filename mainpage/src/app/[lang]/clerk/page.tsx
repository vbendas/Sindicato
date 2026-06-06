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
import { ArrowUp } from "lucide-react";
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { TextShimmer } from "@/components/ui/text-shimmer";
import SuggestionPanel from "./components/SuggestionPanel";
import VariableChipBar from "./components/VariableChipBar";
import WelcomeScreen from "./components/WelcomeScreen";
import {
  getSuggestionGroups,
  filterSuggestions,
  getTemplateDefinition,
} from "./components/suggestions";
import type { SuggestionItem, Variables } from "./components/suggestions";
import type { TemplateVariable } from "./prompts";
import Link from "next/link";
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

type Message = {
  role: "user" | "assistant";
  content: string;
  queryResults?: string;
};

export default function ClerkPage() {
  const { locale } = useLocale();
  const t = useT();

  useEffect(() => {
    document.documentElement.classList.add("clerk-page");
    return () => document.documentElement.classList.remove("clerk-page");
  }, []);

  const WIDGET_STORAGE_KEY = "clerk-widget-state";

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = sessionStorage.getItem(WIDGET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed["query-chat"] || [];
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(WIDGET_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed["query-chat"] = messages;
      sessionStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(parsed));
    } catch {}
  }, [messages]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [variablesData, setVariablesData] = useState<Variables | null>(null);
  const [activeVars, setActiveVars] = useState<TemplateVariable[]>([]);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [varLabels, setVarLabels] = useState<Record<string, string>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const justSubmittedRef = useRef(false);
  const [showFullHeader, setShowFullHeader] = useState(true);
  const [session, setSession] = useState<{
    user?: { role?: string; approvalStatus?: string; companyId?: string; companyName?: string };
  } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const userRole = session?.user?.role ?? null;
  const approvalStatus = session?.user?.approvalStatus ?? null;
  const isPendingApproval = session && approvalStatus === "pending";
  const isRejected = session && approvalStatus === "rejected";
  const isPrivileged = !!(session?.user?.role && approvalStatus === "approved");

  useEffect(() => {
    if (!sessionLoading && session?.user) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Clerk] User role:", userRole);
        console.log("[Clerk] Company name:", session.user.companyName);
        console.log("[Clerk] Approval status:", approvalStatus);
        console.log("[Clerk] Is privileged:", isPrivileged);
      }
    }
  }, [session, userRole, approvalStatus, isPrivileged, sessionLoading]);

  const suggestionGroups = getSuggestionGroups(userRole, t);

  useEffect(() => {
    fetch("/api/clerk/variables")
      .then((r) => r.json())
      .then((d) => setVariablesData(d.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (process.env.NODE_ENV === "development") console.log("[Clerk] Session fetched:", s);
        setSession(s?.user ? s : null);
      })
      .catch((err) => {
        console.error("[Clerk] Failed to fetch session:", err);
        setSession(null);
      })
      .finally(() => setSessionLoading(false));
  }, []);

  const refreshSession = useCallback(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (process.env.NODE_ENV === "development") console.log("[Clerk] Session refreshed:", s);
        setSession(s?.user ? s : null);
      })
      .catch((err) => {
        console.error("[Clerk] Failed to refresh session:", err);
      });
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
        setSession(currentSession);
      } catch (err) {
        console.error("Failed to fetch session:", err);
      }

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
            return;
          }

          setActiveVars(def.variables);
        } else {
          setActiveVars([]);
        }
      } else {
        setActiveVars([]);
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
        const stillPresent = activeVars.filter((v) => value.includes(`{${v.name}}`));
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

  const handleSubmit = useCallback(async () => {
    if (sendDisabled) return;

    justSubmittedRef.current = true;
    setTimeout(() => {
      justSubmittedRef.current = false;
    }, 500);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (showFullHeader) {
      setShowFullHeader(false);
    }

    const userMessage = { role: "user" as const, content: input };
    const newMessages = [
      ...messages,
      userMessage,
      { role: "assistant" as const, content: "" },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setShowShimmer(true);
    setShowSuggestions(false);
    setVarValues({});
    setVarLabels({});
    setActiveVars([]);

    try {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const response = await fetch("/api/clerk/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Response-Mode": "full",
        },
        body: JSON.stringify({
          message: input,
          history: messages,
          locale,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

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

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: result.assistantMessage,
              queryResults: result.queryResults || undefined,
            };
            return updated;
          });
        }

        const final = finalizeStreamParse(state);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: final.assistantMessage,
            queryResults: final.queryResults || undefined,
          };
          return updated;
        });
      } catch (error) {
        console.error("[Stream] Critical parsing error:", error);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: t("clerk.page.errorProcessing"),
            queryResults: undefined,
          };
          return updated;
        });
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: t("clerk.page.canceled"),
          };
          return updated;
        });
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: t("clerk.page.errorGeneric"),
          };
          return updated;
        });
        console.error("Error in clerk query:", error);
      }
    } finally {
      setIsLoading(false);
      setShowShimmer(false);
      abortControllerRef.current = null;
    }
  }, [input, messages, sendDisabled, showFullHeader, locale, t]);

  const handleDownloadMarkdown = (content: string, index: number) => {
    setIsDownloading(true);
    const date = new Date().toISOString().split("T")[0];
    const message = messages[index];

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
      onParseError: () =>
        alert(t("clerk.query.downloadError")),
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
    <>
      <div
        className="fixed inset-0 pointer-events-none z-[60] grain-overlay"
        style={{ opacity: 0.45 }}
      />
      <Header
        scrolledBg={
          showFullHeader
            ? "bg-sindicato-smoked-charcoal border-white/10"
            : "bg-transparent border-transparent"
        }
        clerkBg={
          showFullHeader
            ? "bg-sindicato-bordeaux text-sindicato-warm-white"
            : "bg-sindicato-smoked-charcoal text-sindicato-warm-white"
        }
        navTextColor="text-sindicato-warm-white/70"
        navHoverColor="hover:text-sindicato-warm-white"
        onSessionChange={refreshSession}
      />

      <main className="h-screen flex flex-col bg-sindicato-charcoal pt-16">
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col">
              {isPendingApproval && (
                <div className="mx-4 mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-4 py-3 text-center">
                  <p className="text-yellow-400 text-sm">
                    {t("clerk.page.pendingMessage")}
                  </p>
                </div>
              )}
              {isRejected && (
                <div className="mx-4 mt-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-center">
                  <p className="text-red-400 text-sm">
                    {t("clerk.page.rejectedMessage")}
                  </p>
                </div>
              )}
              <div className="flex-1">
                {sessionLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <TextShimmer className="text-sindicato-warm-white text-lg">
                      {t("clerk.page.analyzing")}
                    </TextShimmer>
                  </div>
                ) : (
                  <WelcomeScreen
                    role={userRole}
                    onSuggestionClick={(label) => {
                      const suggestionItem = suggestionGroups
                        .flatMap((g) => g.suggestions)
                        .find((s) => s.label === label);
                      if (suggestionItem) {
                        handleSuggestionSelect(suggestionItem);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <ChatContainerRoot className="h-full">
              <ChatContainerContent>
                {messages.map((msg, index) => (
                  <ClerkMessageRenderer
                    key={index}
                    role={msg.role}
                    content={msg.content}
                    queryResults={msg.queryResults}
                    isLoading={isLoading}
                    isLast={index === messages.length - 1}
                    showShimmer={showShimmer}
                    compact={false}
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
          {!session && (
            <div className="px-4 pt-2 pb-0">
              <div className="border border-white/10 bg-white/5 px-4 py-2.5 text-center rounded-2xl">
                <p className="text-xs text-sindicato-warm-white/50">
                  <Link
                    href={`/${locale}/register?role=lawyer`}
                    className="underline hover:text-sindicato-warm-white"
                  >
                    {t("clerk.page.registerLegal")}
                  </Link>
                  {" · "}
                  <Link
                    href={`/${locale}/register?role=company`}
                    className="underline hover:text-sindicato-warm-white"
                  >
                    {t("clerk.page.registerCompanies")}
                  </Link>
                  {" · "}
                  <Link
                    href={`/${locale}/register?role=media`}
                    className="underline hover:text-sindicato-warm-white"
                  >
                    {t("clerk.page.registerMedia")}
                  </Link>
                  {" — "}
                  <span className="text-sindicato-warm-white/40">
                    {t("clerk.page.registerPrompt")}
                  </span>
                </p>
              </div>
            </div>
          )}
          <div className="relative px-4 pt-1.5 pb-3">
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
              className="w-full bg-white/5 border-white/10 shadow-xl shadow-black/20 p-2"
            >
              <div className="flex items-center gap-2">
                <PromptInputTextarea
                  placeholder={t("clerk.page.placeholder")}
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
