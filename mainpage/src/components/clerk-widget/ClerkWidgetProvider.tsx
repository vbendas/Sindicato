"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

export type ClerkMode =
  | "home"
  | "kb-chat"
  | "query-chat"
  | "contact";

export type ClerkMessage = {
  role: "user" | "assistant";
  content: string;
  queryResults?: string;
};

type ClerkWidgetContextType = {
  isOpen: boolean;
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  activeMode: ClerkMode;
  setActiveMode: (mode: ClerkMode) => void;
  messages: Record<ClerkMode, ClerkMessage[]>;
  addMessage: (mode: ClerkMode, msg: ClerkMessage) => void;
  updateLastMessage: (mode: ClerkMode, content: string, queryResults?: string) => void;
  clearMessages: (mode: ClerkMode) => void;
  session: {
    user?: {
      role?: string;
      approvalStatus?: string;
      companyId?: string;
      companyName?: string;
    };
  } | null;
  sessionLoading: boolean;
  showProactive: boolean;
  dismissProactive: () => void;
};

const ClerkWidgetContext = createContext<ClerkWidgetContextType | null>(null);

export function useClerkWidget() {
  const ctx = useContext(ClerkWidgetContext);
  if (!ctx) throw new Error("useClerkWidget must be used within ClerkWidgetProvider");
  return ctx;
}

const STORAGE_KEY = "clerk-widget-state";
const WELCOMED_KEY = "clerk-welcomed";

function loadPersistedMessages(): Record<ClerkMode, ClerkMessage[]> {
  if (typeof window === "undefined") {
    return { "home": [], "kb-chat": [], "query-chat": [], "contact": [] };
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { "home": [], "kb-chat": [], "query-chat": [], "contact": [] };
}

function persistMessages(messages: Record<ClerkMode, ClerkMessage[]>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

export function ClerkWidgetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<ClerkMode>("home");
  const [messages, setMessages] = useState<Record<ClerkMode, ClerkMessage[]>>(
    loadPersistedMessages
  );
  const [session, setSession] = useState<ClerkWidgetContextType["session"]>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showProactive, setShowProactive] = useState(false);
  const proactiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    persistMessages(messages);
  }, [messages]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setSession(s?.user ? s : null))
      .catch(() => setSession(null))
      .finally(() => setSessionLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const alreadyWelcomed = localStorage.getItem(WELCOMED_KEY);
    if (alreadyWelcomed) return;

    proactiveTimerRef.current = setTimeout(() => {
      setShowProactive(true);
      localStorage.setItem(WELCOMED_KEY, "true");

      setTimeout(() => {
        setShowProactive(false);
      }, 8000);
    }, 5000);

    return () => {
      if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    };
  }, []);

  const openWidget = useCallback(() => {
    setIsOpen(true);
    setShowProactive(false);
  }, []);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleWidget = useCallback(() => {
    setIsOpen((prev) => !prev);
    setShowProactive(false);
  }, []);

  const dismissProactive = useCallback(() => {
    setShowProactive(false);
  }, []);

  const addMessage = useCallback((mode: ClerkMode, msg: ClerkMessage) => {
    setMessages((prev) => ({
      ...prev,
      [mode]: [...prev[mode], msg],
    }));
  }, []);

  const updateLastMessage = useCallback(
    (mode: ClerkMode, content: string, queryResults?: string) => {
      setMessages((prev) => {
        const modeMessages = [...prev[mode]];
        if (modeMessages.length === 0) return prev;
        modeMessages[modeMessages.length - 1] = {
          ...modeMessages[modeMessages.length - 1],
          content,
          queryResults,
        };
        return { ...prev, [mode]: modeMessages };
      });
    },
    []
  );

  const clearMessages = useCallback((mode: ClerkMode) => {
    setMessages((prev) => ({ ...prev, [mode]: [] }));
  }, []);

  return (
    <ClerkWidgetContext.Provider
      value={{
        isOpen,
        openWidget,
        closeWidget,
        toggleWidget,
        activeMode,
        setActiveMode,
        messages,
        addMessage,
        updateLastMessage,
        clearMessages,
        session,
        sessionLoading,
        showProactive,
        dismissProactive,
      }}
    >
      {children}
    </ClerkWidgetContext.Provider>
  );
}
