"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Step = "email" | "register";

const ROLE_LABELS: Record<string, string> = {
  lawyer: "Legal Professional",
  company: "Company Representative",
  media: "Media & Research",
};

const ROLE_ORGS: Record<string, string> = {
  lawyer: "Law Firm",
  company: "Company Name",
  media: "Publication / Institution",
};

const ROLE_ORG_PLACEHOLDERS: Record<string, string> = {
  lawyer: "Your Law Firm",
  company: "Registered Legal Name",
  media: "Media Outlet / University",
};

const TOS_ROUTES: Record<string, string> = {
  lawyer: "/tos/lawyer",
  company: "/tos/company",
  media: "/tos/media",
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "lawyer";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);

  const roleLabel = ROLE_LABELS[role] || role;
  const orgLabel = ROLE_ORGS[role] || "Organization";
  const orgPlaceholder = ROLE_ORG_PLACEHOLDERS[role] || "Organization name";
  const tosRoute = TOS_ROUTES[role] || "/tos/lawyer";

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send code.");
        return;
      }
      setStep("register");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!tosAccepted) {
      setError("You must accept the Terms of Service to continue.");
      return;
    }
    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          role,
          displayName,
          organization: organization || undefined,
          tosVersion: "1.0",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }
      router.push(data.data.redirect || "/pending-approval");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/20 text-sindicato-warm-white p-3 text-sm focus:outline-none focus:border-white/50 transition-colors";
  const labelClass = "block text-sm font-bold uppercase tracking-wider text-sindicato-warm-white/70 mb-1.5 font-[family-name:var(--font-barlow)]";
  const btnClass = "w-full bg-sindicato-warm-white text-sindicato-charcoal py-3 text-sm font-bold uppercase tracking-wider hover:bg-sindicato-warm-white/90 transition-all disabled:opacity-50 font-[family-name:var(--font-barlow)]";

  return (
    <>
      <div className="text-center mb-10">
        <p className="text-sm text-sindicato-warm-white/50 uppercase tracking-wider mb-1 font-[family-name:var(--font-barlow)] font-bold">
          Register as
        </p>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-barlow)] uppercase tracking-wider">
          {roleLabel}
        </h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {step === "email" && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
              required
            />
          </div>
          <button type="submit" disabled={loading || !email} className={btnClass}>
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      )}

      {step === "register" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Verification Code</label>
            <p className="text-xs text-sindicato-warm-white/50 mb-2">
              A 6-digit code was sent to {email}.
            </p>
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
          </div>

          <div>
            <label className={labelClass}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={role === "company" ? "Company Name" : "Your Full Name"}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>{orgLabel}</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder={orgPlaceholder}
              className={inputClass}
            />
          </div>

          <div className="border border-white/20 p-4 space-y-4">
            <p className="text-sm text-sindicato-warm-white/65 leading-relaxed">
              By creating an account, you agree to the{" "}
              <Link href={tosRoute} target="_blank" className="underline hover:text-sindicato-warm-white">
                Terms of Service
              </Link>{" "}
              governing your use of this platform. Please review them carefully.
            </p>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={(e) => setTosAccepted(e.target.checked)}
                className="mt-1 accent-sindicato-warm-white"
              />
              <span className="text-sm text-sindicato-warm-white/65 leading-relaxed">
                I have read and accept the{" "}
                <Link href={tosRoute} target="_blank" className="underline hover:text-sindicato-warm-white">
                  Terms of Service
                </Link>{" "}
                for {roleLabel.toLowerCase()} access.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !displayName || !tosAccepted || code.length !== 6}
            className={btnClass}
          >
            {loading ? "Submitting..." : "Submit for Approval"}
          </button>

          <button
            type="button"
            onClick={handleSendCode}
            disabled={loading}
            className="w-full text-center text-sindicato-warm-white/40 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors"
          >
            Resend code
          </button>
        </form>
      )}
    </>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-sindicato-charcoal text-sindicato-warm-white">
      <div className="max-w-md mx-auto px-4 py-20">
        <Suspense fallback={
          <div className="text-center py-20">
            <p className="text-sindicato-warm-white/50">Loading...</p>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
