"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";

interface NotificationToggleProps {
  caseId: string;
  email?: string;
}

export function NotificationToggle({ caseId, email }: NotificationToggleProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [inputEmail, setInputEmail] = useState(email ?? "");
  const [showInput, setShowInput] = useState(!email);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}/notifications`);
      const json = await res.json();
      if (json.ok) setCount(json.data.count);
    } catch {}
  }, [caseId]);

  const toggle = async () => {
    if (showInput && !inputEmail.includes("@")) return;
    setLoading(true);
    try {
      if (subscribed) {
        await fetch(`/api/cases/${caseId}/notifications`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: inputEmail }),
        });
        setSubscribed(false);
      } else {
        await fetch(`/api/cases/${caseId}/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: inputEmail }),
        });
        setSubscribed(true);
        setShowInput(false);
      }
      await fetchCount();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex items-center gap-2">
        {showInput && (
          <input
            type="email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-white/5 border border-white/10 text-sindicato-warm-white text-xs px-2 py-1 w-48"
          />
        )}
        <Button
          onClick={toggle}
          disabled={loading}
          className="bg-sindicato-bordeaux hover:bg-sindicato-bordeaux/80 text-sindicato-warm-white text-xs flex items-center gap-1"
        >
          {subscribed ? <BellOff size={12} /> : <Bell size={12} />}
          {subscribed ? "Unsubscribe" : "Subscribe"}
        </Button>
        {count !== null && (
          <span className="text-sindicato-warm-white/40 text-[11px]">
            {count} subscriber{count !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={toggle}
        disabled={loading}
        className="bg-sindicato-bordeaux hover:bg-sindicato-bordeaux/80 text-sindicato-warm-white text-xs flex items-center gap-1"
      >
        {subscribed ? <BellOff size={12} /> : <Bell size={12} />}
        {subscribed ? "Unsubscribe" : "Subscribe"}
      </Button>
      {count !== null && (
        <span className="text-sindicato-warm-white/40 text-[11px]">
          {count} subscriber{count !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
