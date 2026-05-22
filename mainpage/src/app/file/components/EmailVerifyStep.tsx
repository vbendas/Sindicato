"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

interface EmailVerifyStepProps {
  onSuccess: (email: string, workerId: string) => void;
}

export default function EmailVerifyStep({ onSuccess }: EmailVerifyStepProps) {
  const [subStep, setSubStep] = useState<"enter-email" | "enter-code">("enter-email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send code. Please try again.");
        return;
      }
      setSubStep("enter-code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        code,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid or expired code. Please try again.");
        return;
      }
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const workerId = session?.user?.id ?? "";
      onSuccess(email, workerId);
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setCode("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white border border-sindicato-charcoal/20 rounded-none text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none focus:ring-0 transition-colors text-sm";
  const labelClass =
    "block text-sindicato-charcoal/70 mb-2 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold";
  const primaryBtnClass =
    "w-full bg-sindicato-bordeaux text-sindicato-cream py-3 px-6 font-bold uppercase tracking-wider hover:bg-sindicato-bordeaux-dark transition-colors font-[family-name:var(--font-barlow)] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white border border-sindicato-charcoal/10 p-6 sm:p-8">
        {subStep === "enter-email" ? (
          <>
            <h2 className="text-2xl font-bold text-sindicato-charcoal font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-2">
              Verify your identity
            </h2>
            <p className="text-sindicato-charcoal/60 text-sm mb-8">
              We&apos;ll send a one-time code to protect against fake reports.
            </p>
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                  required
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className={primaryBtnClass}
              >
                {loading ? "Sending..." : "Send Code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-sindicato-charcoal font-[family-name:var(--font-barlow)] uppercase tracking-wider mb-2">
              Check your email
            </h2>
            <p className="text-sindicato-charcoal/60 text-sm mb-8">
              We sent a 6-digit code to{" "}
              <span className="font-bold text-sindicato-charcoal">{email}</span>
            </p>
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label htmlFor="code" className={labelClass}>
                  6-digit code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  autoComplete="one-time-code"
                  className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em] h-16`}
                  required
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className={primaryBtnClass}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-xs text-sindicato-charcoal/50 hover:text-sindicato-bordeaux transition-colors underline font-[family-name:var(--font-barlow)] uppercase tracking-wider"
                >
                  Resend code
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}
