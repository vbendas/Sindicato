"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { LocalizedLink } from "@/lib/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useT, useLocale } from "@/lib/i18n";

interface HeaderProps {
  scrolledBg?: string;
  clerkBg?: string;
  navTextColor?: string;
  navHoverColor?: string;
  onSessionChange?: () => void;
}

export default function Header({ 
  scrolledBg = "bg-sindicato-bordeaux/70 backdrop-blur-md border-white/10", 
  clerkBg = "bg-sindicato-charcoal text-sindicato-warm-white", 
  navTextColor = "text-sindicato-warm-white/70", 
  navHoverColor = "hover:text-sindicato-warm-white",
  onSessionChange
}: HeaderProps) {
  const t = useT();
  const { locale } = useLocale();
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
    const controller = new AbortController();
    fetch("/api/auth/session", { signal: controller.signal })
      .then((r) => r.json())
      .then((s) => setSession(s?.user ? s : null))
      .catch(() => setSession(null))
      .finally(() => setSessionLoading(false));
    return () => controller.abort();
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
        setAuthError(data.error || t("header.errorSendCode"));
        return;
      }
      setSubStep("code");
    } catch {
      setAuthError(t("header.errorNetwork"));
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
        setAuthError(t("header.errorInvalidCode"));
        return;
      }
      const res = await fetch("/api/auth/session");
      const s = await res.json();
      setSession(s?.user ? s : null);
      setShowLogin(false);
      resetAuthForm();
      onSessionChange?.();
    } catch {
      setAuthError(t("header.errorVerification"));
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
            <LocalizedLink
              href="/"
              className={`${navTextColor} ${navHoverColor} transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full`}
            >
              {t("header.navHome")}
            </LocalizedLink>
            <LocalizedLink
              href="/manifesto"
              className={`${navTextColor} ${navHoverColor} transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full`}
            >
              {t("header.navManifesto")}
            </LocalizedLink>
            <LocalizedLink
              href="/about"
              className={`${navTextColor} ${navHoverColor} transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full`}
            >
              {t("header.navAbout")}
            </LocalizedLink>
          </nav>

          <LocalizedLink href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 shrink-0">
            <span className={`text-lg sm:text-xl lg:text-2xl font-bold tracking-widest uppercase font-[family-name:var(--font-labor-union)] ${navTextColor}`}>
              {t("header.brand")}
            </span>
          </LocalizedLink>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href={`/${locale}/file`}
              className={`${navTextColor} ${navHoverColor} transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full`}
            >
              {t("header.navReport")}
            </Link>
            <LocalizedLink
              href="/cases"
              className={`${navTextColor} ${navHoverColor} transition-colors uppercase tracking-wider text-xs lg:text-sm font-[family-name:var(--font-barlow)] font-bold relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-white/50 after:transition-all hover:after:w-full`}
            >
              {t("header.navCases")}
            </LocalizedLink>
            {session?.user ? (
              <div className="relative group">
                <button className={`${clerkBg} px-4 lg:px-5 py-1.5 lg:py-2 text-xs lg:text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-all font-[family-name:var(--font-barlow)] shadow-sm`}>
                  {t("header.account")}
                </button>
                <div className="absolute right-0 top-full pt-2 hidden group-hover:block min-w-[180px]">
                  <div className="bg-sindicato-charcoal border border-white/10 shadow-xl">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sindicato-warm-white/40 text-[10px] font-[family-name:var(--font-jetbrains)] truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <LocalizedLink
                      href="/account"
                      className="block px-4 py-2 text-sindicato-warm-white/80 hover:text-sindicato-warm-white hover:bg-white/5 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold transition-colors"
                    >
                      {t("header.myCases")}
                    </LocalizedLink>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-red-400/80 hover:text-red-400 hover:bg-white/5 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold transition-colors"
                    >
                      {t("header.logout")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Dialog open={showLogin} onOpenChange={(o) => { setShowLogin(o); if (!o) resetAuthForm(); }}>
                <DialogTrigger className={`${clerkBg} px-4 lg:px-5 py-1.5 lg:py-2 text-xs lg:text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-all font-[family-name:var(--font-barlow)] shadow-sm`}>
                  {t("header.signIn")}
                </DialogTrigger>
                <DialogContent className="bg-sindicato-slate border border-white/20 text-sindicato-warm-white max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-sindicato-warm-white font-[family-name:var(--font-barlow)] uppercase tracking-wider">
                      {subStep === "email" ? t("header.signInTitle") : t("header.checkEmailTitle")}
                    </DialogTitle>
                    <DialogDescription className="text-sindicato-warm-white/50 text-xs">
                      {subStep === "email"
                        ? t("header.signInDescription")
                        : t("header.checkEmailDescription", { email })
                      }
                    </DialogDescription>
                  </DialogHeader>

                  {subStep === "email" ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("header.emailPlaceholder")}
                        className={inputClass}
                        required
                      />
                      {authError && <p className="text-xs text-red-400">{authError}</p>}
                      <button type="submit" disabled={authLoading || !email} className={btnClass}>
                        {authLoading ? t("header.sending") : t("header.sendCode")}
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
                        placeholder={t("header.codePlaceholder")}
                        className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em] h-14`}
                        required
                      />
                      {authError && <p className="text-xs text-red-400">{authError}</p>}
                      <button type="submit" disabled={authLoading || code.length !== 6} className={btnClass}>
                        {authLoading ? t("header.verifying") : t("header.verify")}
                      </button>
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={authLoading}
                        className="w-full text-center text-sindicato-warm-white/40 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors"
                      >
                        {t("header.resendCode")}
                      </button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            <Link
              href={`/${locale}/file`}
              className="bg-sindicato-charcoal text-sindicato-warm-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)]"
            >
              {t("header.mobileReport")}
            </Link>
            {session?.user ? (
              <LocalizedLink
                href="/account"
                className={`${clerkBg} px-3 py-1.5 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)]`}
              >
                {t("header.account")}
              </LocalizedLink>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className={`${clerkBg} px-3 py-1.5 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-barlow)]`}
              >
                {t("header.signIn")}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
