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
import { TextShimmer } from "@/components/ui/text-shimmer";
import SuggestionPanel from "./components/SuggestionPanel";
import VariableChipBar from "./components/VariableChipBar";
import WelcomeScreen from "./components/WelcomeScreen";
import { getSuggestionGroups, filterSuggestions, getTemplateDefinition } from "./components/suggestions";
import type { SuggestionItem, Variables } from "./components/suggestions";
import type { TemplateVariable } from "./prompts";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { ClerkChart } from "@/components/clerk/ClerkChart";

type Message = {
  role: "user" | "assistant";
  content: string;
  queryResults?: string;
};

export default function ClerkPage() {
  const { locale } = useLocale();
  
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
  const [session, setSession] = useState<{ user?: { role?: string; approvalStatus?: string; companyId?: string; companyName?: string } } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const userRole = session?.user?.role ?? null;
  const approvalStatus = session?.user?.approvalStatus ?? null;
  const isPendingApproval = session && approvalStatus === "pending";
  const isRejected = session && approvalStatus === "rejected";
  const isApproved = session && approvalStatus === "approved";
  const isPrivileged = !!(session?.user?.role && approvalStatus === "approved");

  // Debug logging for role detection
  useEffect(() => {
    if (!sessionLoading && session?.user) {
      console.log('[Clerk] User role:', userRole);
      console.log('[Clerk] Company name:', session.user.companyName);
      console.log('[Clerk] Approval status:', approvalStatus);
      console.log('[Clerk] Is privileged:', isPrivileged);
    }
  }, [session, userRole, approvalStatus, isPrivileged, sessionLoading]);

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
      .then((s) => {
        console.log('[Clerk] Session fetched:', s);
        setSession(s?.user ? s : null);
      })
      .catch((err) => {
        console.error('[Clerk] Failed to fetch session:', err);
        setSession(null);
      })
      .finally(() => setSessionLoading(false));
  }, []);

  const refreshSession = useCallback(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        console.log('[Clerk] Session refreshed:', s);
        setSession(s?.user ? s : null);
      })
      .catch((err) => {
        console.error('[Clerk] Failed to refresh session:', err);
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

  const handleSuggestionSelect = useCallback(async (suggestion: SuggestionItem) => {
    setInput(suggestion.template);
    setShowSuggestions(false);
    setVarValues({});
    setVarLabels({});

    // Fetch fresh session to ensure companyName is available
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
        const companyVar = def.variables.find(v => v.name === "company");
        
        if (companyVar && userRole === "company" && currentSession?.user?.companyName) {
          const resolved = suggestion.template.replace(`{${companyVar.name}}`, currentSession.user.companyName);
          setInput(resolved);
          setVarValues({ company: currentSession.user.companyName });
          setVarLabels({ company: currentSession.user.companyName });
          const filtered = def.variables.filter(v => v.name !== "company");
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
    
    // Add user message and empty assistant message to the chat
    const newMessages = [...messages, userMessage, { role: "assistant" as const, content: "" }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setShowShimmer(true);
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

      // Read the stream response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let assistantMessage = "";
      let queryResults = "";
      let firstChunkReceived = false;
      let rawResultsComplete = false;
      let buffer = "";
      let hasMarkers = true;
      let chunkCount = 0;
      const MAX_BUFFER_CHUNKS = 5;
      
      console.log("[Stream] Starting stream parser");
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("[Stream] Stream complete, total chunks:", chunkCount);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          chunkCount++;
          console.log(`[Stream] Chunk ${chunkCount} received, length:`, chunk.length);
          
          // Track first chunk and keep shimmer visible for minimum duration
          if (!firstChunkReceived) {
            firstChunkReceived = true;
            setTimeout(() => {
              setShowShimmer(false);
            }, 1000);
            
            // Check if response has markers
            if (!chunk.includes("__RAW_RESULTS__")) {
              hasMarkers = false;
              console.log("[Stream] No markers detected in first chunk, streaming directly");
            } else {
              console.log("[Stream] Markers detected in first chunk");
            }
          }

          // If no markers, stream directly
          if (!hasMarkers) {
            assistantMessage += chunk;
            console.log("[Stream] Direct streaming, assistantMessage length:", assistantMessage.length);
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { 
                role: "assistant", 
                content: assistantMessage,
                queryResults: undefined
              };
              return updated;
            });
            continue;
          }

          // Parse raw results marker
          if (!rawResultsComplete) {
            buffer += chunk;
            const startMarker = "__RAW_RESULTS__";
            const endMarker = "__END_RAW_RESULTS__";
            
            // Safety check: timeout after too many chunks
            if (chunkCount > MAX_BUFFER_CHUNKS && !buffer.includes(startMarker)) {
              console.warn("[Stream] Timeout: no markers found after", chunkCount, "chunks");
              hasMarkers = false;
              assistantMessage = buffer;
              buffer = "";
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { 
                  role: "assistant", 
                  content: assistantMessage,
                  queryResults: undefined
                };
                return updated;
              });
              continue;
            }
            
            if (buffer.includes(startMarker) && buffer.includes(endMarker)) {
              try {
                const startIndex = buffer.indexOf(startMarker) + startMarker.length;
                const endIndex = buffer.indexOf(endMarker);
                queryResults = buffer.substring(startIndex, endIndex);
                const remaining = buffer.substring(endIndex + endMarker.length);
                assistantMessage = remaining;
                buffer = "";
                rawResultsComplete = true;
                console.log("[Stream] Raw results extracted successfully");
                console.log("[Stream] Query results length:", queryResults.length);
                console.log("[Stream] Remaining (assistantMessage) length:", assistantMessage.length);
              } catch (parseError) {
                console.error("[Stream] Failed to parse raw results:", parseError);
                hasMarkers = false;
                assistantMessage = buffer;
                buffer = "";
              }
            } else {
              console.log("[Stream] Still buffering, buffer length:", buffer.length);
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { 
                  role: "assistant", 
                  content: "",
                  queryResults: undefined
                };
                return updated;
              });
              continue;
            }
          } else {
            assistantMessage += chunk;
            console.log("[Stream] Post-marker streaming, assistantMessage length:", assistantMessage.length);
          }

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { 
              role: "assistant", 
              content: assistantMessage,
              queryResults: queryResults || undefined
            };
            return updated;
          });
        }
        
        // Handle stream ending while still buffering
        if (!rawResultsComplete && buffer.length > 0) {
          console.warn("[Stream] Stream ended while still buffering, using buffer as response");
          assistantMessage = buffer;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { 
              role: "assistant", 
              content: assistantMessage,
              queryResults: undefined
            };
            return updated;
          });
        }
        
        console.log("[Stream] Final assistantMessage length:", assistantMessage.length);
      } catch (error) {
        console.error("[Stream] Critical parsing error:", error);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: "assistant", 
            content: "I apologize, but I encountered an error processing your request. Please try again.",
            queryResults: undefined
          };
          return updated;
        });
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
      setShowShimmer(false);
      abortControllerRef.current = null;
    }
  }, [input, messages, sendDisabled, showFullHeader]);

  const handleDownloadMarkdown = (content: string, index: number) => {
    const date = new Date().toISOString().split("T")[0];
    const message = messages[index];
    let fullContent = content;
    
    // Show loading state
    setIsDownloading(true);
    
    // If we have raw query results with detailed data, append them
    if (message.queryResults) {
      try {
        const results = JSON.parse(message.queryResults);
        
        console.log('[Download] Parsed queryResults:', {
          totalRows: results.rows?.length || 0,
          firstRowStoryLength: results.rows?.[0]?.story?.length || 0,
          lastRowStoryLength: results.rows?.[results.rows.length - 1]?.story?.length || 0
        });
        
        if (results.rows && results.rows.length > 0) {
          fullContent += '\n\n---\n\n## Full Case Details\n\n';
          fullContent += `*This report contains ${results.rows.length} cases with complete stories.*\n\n`;
          
          results.rows.forEach((row: any, idx: number) => {
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
            fullContent += '---\n\n';
          });
        }
      } catch (e) {
        console.error('Failed to parse query results for download:', e);
        console.error('queryResults preview:', message.queryResults?.substring(0, 200));
        
        // Show user-friendly error
        alert('Unable to download full case details. The data format is invalid. Please try refreshing the page and running the query again.');
        setIsDownloading(false);
        return;
      }
    } else {
      console.warn('[Download] No queryResults available for this message');
    }
    
    const md = `# Sindicato Data Report\n\nGenerated: ${date}\n\n---\n\n${fullContent}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sindicato-report-${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Hide loading state
    setIsDownloading(false);
  };

  const filteredGroups = filterSuggestions(suggestionGroups, input);
  const panelVisible = showSuggestions && filteredGroups.some((g) => g.suggestions.length > 0);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <Header
        scrolledBg={showFullHeader ? "bg-sindicato-smoked-charcoal border-white/10" : "bg-transparent border-transparent"}
        clerkBg={showFullHeader ? "bg-sindicato-bordeaux text-sindicato-warm-white" : "bg-sindicato-smoked-charcoal text-sindicato-warm-white"}
        navTextColor={showFullHeader ? "text-sindicato-warm-white/70" : "text-sindicato-warm-white/70"}
        navHoverColor={showFullHeader ? "hover:text-sindicato-warm-white" : "hover:text-sindicato-warm-white"}
        onSessionChange={refreshSession}
      />
      

      <main className="h-screen flex flex-col bg-sindicato-charcoal pt-16">
        {/* Chat area - fills remaining space */}
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col">
              {isPendingApproval && (
                <div className="mx-4 mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-4 py-3 text-center">
                  <p className="text-yellow-400 text-sm">
                    Your account is pending approval. You can explore public data while you wait.
                    Contact information will be available once your account is approved.
                  </p>
                </div>
              )}
              {isRejected && (
                <div className="mx-4 mt-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-center">
                  <p className="text-red-400 text-sm">
                    Your account request was not approved. You can still explore public data.
                  </p>
                </div>
              )}
              <div className="flex-1">
                {sessionLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <TextShimmer className="text-sindicato-warm-white text-lg">Loading...</TextShimmer>
                  </div>
                ) : (
                  <WelcomeScreen role={userRole} onSuggestionClick={(label) => {
                    const suggestionItem = suggestionGroups
                      .flatMap(g => g.suggestions)
                      .find(s => s.label === label);
                    if (suggestionItem) {
                      handleSuggestionSelect(suggestionItem);
                    }
                  }} />
                )}
              </div>
            </div>
          ) : (
            <ChatContainerRoot className="h-full">
              <ChatContainerContent>
                {messages.map((msg, index) => (
                  msg.role === "user" ? (
                    <Message key={index} className="mb-4 justify-end items-center">
                      <MessageContent className="bg-sindicato-cream text-sindicato-charcoal rounded-3xl px-5 py-3 max-w-[80%] shadow-md shadow-black/10">
                        {msg.content}
                      </MessageContent>
                      <MessageAvatar src="/clerk-avatar.png" alt="You" fallback="👤" className="ml-3 size-20 border-2 border-black bg-sindicato-pine" />
                    </Message>
                  ) : (
                    <Message key={index} className="mb-4 items-center">
                      <MessageAvatar src="/clerk.png" alt="Clerk AI" fallback="🤖" className="mr-3 size-20 border-2 border-black bg-sindicato-bordeaux" />
                      {showShimmer && isLoading && index === messages.length - 1 ? (
                        <div className="ml-3 flex items-center px-5 py-3 max-w-[80%] rounded-3xl bg-sindicato-smoked-charcoal/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
                          <TextShimmer className="font-medium text-sindicato-warm-white">Analyzing data</TextShimmer>
                        </div>
                      ) : (
                        <div className="flex flex-col max-w-[80%]">
                          <MessageContent 
                            className={`ml-3 rounded-3xl px-5 py-3 text-sindicato-warm-white bg-sindicato-smoked-charcoal/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 ${
                              msg.content.includes("can only answer questions about Sindicato's worker exploitation data") 
                                ? 'bg-red-500/20 border border-red-500/30' 
                                : ''
                            }`}
                            markdown={true}
                          >
                            {msg.content}
                          </MessageContent>
                          {msg.content && !msg.content.includes("can only answer") && !msg.content.includes("Request was canceled") && !msg.content.includes("An error occurred") && msg.queryResults && (
                            <ClerkChart
                              queryResults={msg.queryResults}
                              compact={false}
                              className="ml-3 mt-3"
                            />
                          )}
{msg.content && !msg.content.includes("can only answer") && !msg.content.includes("Request was canceled") && !msg.content.includes("An error occurred") && (msg.content.includes("|") || msg.content.includes("- ")) && (
                          <button
                            onClick={() => handleDownloadMarkdown(msg.content, index)}
                            disabled={isDownloading}
                            className="ml-3 mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-sindicato-warm-white/40 hover:text-sindicato-warm-white/70 disabled:text-sindicato-warm-white/20 disabled:cursor-not-allowed transition-all self-start bg-white/5 hover:bg-white/10 border border-white/5"
                          >
                            {isDownloading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-sindicato-warm-white/30 border-t-sindicato-warm-white rounded-full animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download size={12} />
                                Download .md
                              </>
                            )}
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
        <div className="border-t border-white/5 bg-sindicato-smoked-charcoal/60 backdrop-blur-2xl">
          {!session && (
            <div className="px-4 pt-2 pb-0">
              <div className="border border-white/10 bg-white/5 px-4 py-2.5 text-center rounded-2xl">
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
