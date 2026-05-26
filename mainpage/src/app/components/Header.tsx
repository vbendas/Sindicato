"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HeaderProps {
  scrolledBg?: string;
  clerkBg?: string;
  navTextColor?: string;
  navHoverColor?: string;
}

export default function Header({   scrolledBg = "bg-sindicato-bordeaux/70 backdrop-blur-md border-white/10", clerkBg = "bg-sindicato-charcoal text-sindicato-warm-white", navTextColor = "text-sindicato-warm-white/70", navHoverColor = "hover:text-sindicato-warm-white" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<{ user?: { id?: string; email?: string } } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [subStep, setSubStep] = useState<"email" | "code">("email");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setSession(s?.user ? s : null))
      .catch(() => setSession(null))
      .finally(() => setSessionLoading(false));
  }, []);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    if (!email) return;
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Failed to send code.");
        return;
      }
      setSubStep("code");
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    if (code.length !== 6) return;
    setAuthLoading(true);
    try {
      const result = await signIn("credentials", { email, code, redirect: false });
      if (result?.error) {
        setAuthError("Invalid or expired code. Please try again.");
        return;
      }
      const res = await fetch("/api/auth/session");
      const s = await res.json();
      setSession(s?.user ? s : null);
      setShowLogin(false);
      resetAuthForm();
    } catch {
      setAuthError("Verification failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  function resetAuthForm() {
    setEmail("");
    setCode("");
    setSubStep("email");
    setAuthError("");
  }

  const inputClass = "w-full bg-white/5 border border-white/10 text-sindicato-warm-white p-2 text-sm focus:outline-none focus:border-white/30";
  const btnClass = "w-full bg-white/10 text-sindicato-warm-white py-2 text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors disabled:opacity-50";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? scrolledBg
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 relative">
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className={`${navTextColor} ${navHoverColor} transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full`}
            >
              Home
            </Link>
            <Link
              href="/manifesto"
              className={`${navTextColor} ${navHoverColor} transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full`}
            >
              Manifesto
            </Link>
            <Link
              href="/about"
              className={`${navTextColor} ${navHoverColor} transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full`}
            >
              About Us
            </Link>
            <Link
              href="/clerk"
              className={`${navTextColor} ${navHoverColor} transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full`}
            >
              Clerk
            </Link>
          </nav>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 shrink-0">
            <span className={`text-lg sm:text-xl lg:text-2xl font-bold tracking-widest uppercase font-[family-name:var(--font-labor-union)] ${navTextColor}`}>
              SINDICATO
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/file"
              className={`${navTextColor} ${navHoverColor} transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full`}
            >
              Report a Case
            </Link>
            <Link
              href="/cases"
              className={`${navTextColor} ${navHoverColor} transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full`}
            >
              View Cases
            </Link>
            {session?.user ? (
              <div className="relative group">
                <button className={`${clerkBg} px-4 lg:px-5 py-1.5 lg:py-2 text-xs lg:text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-all font-[family-name:var(--font-barlow)] shadow-sm`}>
                  Account
                </button>
                <div className="absolute right-0 top-full pt-2 hidden group-hover:block min-w-[180px]">
                  <div className="bg-sindicato-charcoal border border-white/10 shadow-xl">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sindicato-warm-white/40 text-[10px] font-[family-name:var(--font-jetbrains)] truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sindicato-warm-white/80 hover:text-sindicato-warm-white hover:bg-white/5 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold transition-colors"
                    >
                      My Cases
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-red-400/80 hover:text-red-400 hover:bg-white/5 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Dialog open={showLogin} onOpenChange={(o) => { setShowLogin(o); if (!o) resetAuthForm(); }}>
                <DialogTrigger className={`${clerkBg} px-4 lg:px-5 py-1.5 lg:py-2 text-xs lg:text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-all font-[family-name:var(--font-barlow)] shadow-sm`}>
                  Sign In
                </DialogTrigger>
                <DialogContent className="bg-sindicato-slate border border-white/20 text-sindicato-warm-white max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider">
                      {subStep === "email" ? "Sign In" : "Check your email"}
                    </DialogTitle>
                    <DialogDescription className="text-sindicato-warm-white/50 text-xs">
                      {subStep === "email"
                        ? "Enter your email to receive a one-time code."
                        : `We sent a 6-digit code to ${email}.`
                      }
                    </DialogDescription>
                  </DialogHeader>

                  {subStep === "email" ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={inputClass}
                        required
                      />
                      {authError && <p className="text-xs text-red-400">{authError}</p>}
                      <button type="submit" disabled={authLoading || !email} className={btnClass}>
                        {authLoading ? "Sending..." : "Send Code"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em] h-14`}
                        required
                      />
                      {authError && <p className="text-xs text-red-400">{authError}</p>}
                      <button type="submit" disabled={authLoading || code.length !== 6} className={btnClass}>
                        {authLoading ? "Verifying..." : "Verify"}
                      </button>
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={authLoading}
                        className="w-full text-center text-sindicato-warm-white/40 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors"
                      >
                        Resend code
                      </button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            <Link
              href="/file"
              className="bg-sindicato-charcoal text-sindicato-warm-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)]"
            >
              Report
            </Link>
            {session?.user ? (
              <Link
                href="/account"
                className={`${clerkBg} px-3 py-1.5 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)]`}
              >
                Account
              </Link>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className={`${clerkBg} px-3 py-1.5 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)]`}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
