"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

interface CaseFormProps {
  onSuccess: () => void;
  initialCompany?: string;
}

interface StrengthElement {
  name: string;
  passed: boolean;
  note: string;
}

interface StrengthEvaluation {
  elements: StrengthElement[];
  score: number;
  maxScore: number;
  summary: string;
}

export default function CaseForm({ onSuccess, initialCompany }: CaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [strengthEval, setStrengthEval] = useState<StrengthEvaluation | null>(null);
  const [strengthLoading, setStrengthLoading] = useState(false);

  const [formData, setFormData] = useState({
    vertical: "",
    displayName: "",
    country: "",
    ageRange: "",
    sex: "",
    project: "",
    dateRange: "",
    amountOwed: "",
    currency: "EUR",
    contactAttempts: "",
    story: "",
    email: "",
    companySlug: initialCompany || "",
    optInSolicitor: false,
    optInCollective: false,
    optInCompanyNotify: true,
    attested: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const doSubmit = useCallback(async (token: string) => {
    setError("");

    try {
      const payload = {
        ...formData,
        contactAttempts: Number(formData.contactAttempts),
        amountOwed: formData.amountOwed,
        turnstileToken: token,
      };

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to submit case");
      }

      setIsSubmitted(true);
      fetchCaseStrength();
      setTimeout(() => {
        onSuccess();
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.vertical) {
      setError("Select the type of work you do.");
      return;
    }

    if (turnstileToken) {
      setIsSubmitting(true);
      doSubmit(turnstileToken);
      return;
    }

    turnstileRef.current?.execute();
    setIsSubmitting(true);
  };

  const onTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
    if (isSubmitting) {
      doSubmit(token);
    }
  };

  const fetchCaseStrength = async () => {
    setStrengthLoading(true);
    try {
      const response = await fetch("/api/ai/case-strength", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.displayName,
          country: formData.country,
          project: formData.project,
          dateRange: formData.dateRange,
          amountOwed: formData.amountOwed,
          currency: formData.currency,
          contactAttempts: Number(formData.contactAttempts),
          story: formData.story,
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setStrengthEval(data.data);
      }
    } catch {
    } finally {
      setStrengthLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-12 max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-sindicato-charcoal mb-4">
            Case Submitted Successfully
          </h3>
          <p className="text-sindicato-charcoal/70">
            Thank you for sharing your story. Your case will be reviewed and published shortly.
          </p>
        </div>

        {strengthEval && (
          <div className="border border-sindicato-bordeaux/20 p-6">
            <h4 className="text-lg font-bold text-sindicato-bordeaux mb-4 font-[family-name:var(--font-barlow)] tracking-wide uppercase">
              Case Strength Analysis
            </h4>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-sindicato-bordeaux">
                  {strengthEval.score}/{strengthEval.maxScore}
                </span>
                <div className="flex-1 h-3 bg-sindicato-bordeaux/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(strengthEval.score / strengthEval.maxScore) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-sindicato-bordeaux rounded-full"
                  />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {strengthEval.elements.map((el, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-sm mt-0.5 ${el.passed ? "text-green-500" : "text-red-400"}`}>
                      {el.passed ? "\u2713" : "\u2717"}
                    </span>
                    <div>
                      <span className="text-sindicato-charcoal/80 text-sm font-medium">{el.name}</span>
                      <p className="text-sindicato-charcoal/50 text-xs">{el.note}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sindicato-charcoal/60 text-sm border-t border-sindicato-bordeaux/10 pt-3">
                {strengthEval.summary}
              </p>
            </motion.div>
          </div>
        )}

        {strengthLoading && (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-sindicato-bordeaux" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-sindicato-bordeaux p-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sindicato-charcoal/80 mb-3 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
          Type of Work *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, vertical: "remote" }))}
            className={`p-4 border-2 text-left transition-colors ${
              formData.vertical === "remote"
                ? "border-sindicato-bordeaux bg-sindicato-bordeaux/10 text-sindicato-bordeaux"
                : "border-sindicato-bordeaux/20 text-sindicato-charcoal/60 hover:border-sindicato-bordeaux/40"
            }`}
          >
            <div className="font-bold text-sm uppercase tracking-wider mb-1 font-[family-name:var(--font-barlow)]">Remote Platform</div>
            <div className="text-xs opacity-70">Data annotators, translators, freelancers</div>
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, vertical: "gig" }))}
            className={`p-4 border-2 text-left transition-colors ${
              formData.vertical === "gig"
                ? "border-sindicato-bordeaux bg-sindicato-bordeaux/10 text-sindicato-bordeaux"
                : "border-sindicato-bordeaux/20 text-sindicato-charcoal/60 hover:border-sindicato-bordeaux/40"
            }`}
          >
            <div className="font-bold text-sm uppercase tracking-wider mb-1 font-[family-name:var(--font-barlow)]">Gig Delivery</div>
            <div className="text-xs opacity-70">Uber, Glovo, DoorDash, Just Eat</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sindicato-charcoal/80 mb-2 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
            Display Name *
          </label>
          <input
            type="text"
            name="displayName"
            required
            value={formData.displayName}
            onChange={handleChange}
            placeholder="First name or pseudonym"
            className="w-full bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sindicato-charcoal/80 mb-2 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
            Country
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Your country (optional)"
            className="w-full bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sindicato-charcoal/80 mb-2 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
            Age Range
          </label>
          <select
            name="ageRange"
            value={formData.ageRange}
            onChange={handleChange}
            className="w-full bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors"
          >
            <option value="">Prefer not to say</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45+">45+</option>
          </select>
        </div>

        <div>
          <label className="block text-sindicato-charcoal/80 mb-2 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
            Sex
          </label>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            className="w-full bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sindicato-charcoal/80 mb-2 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
          Company *
        </label>
        <input
          type="text"
          name="companySlug"
          required
          value={formData.companySlug}
          onChange={handleChange}
          placeholder="Company name or slug (e.g., alignerr, uber)"
          className="w-full bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sindicato-charcoal/80 mb-2 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
          Project (optional)
        </label>
        <input
          type="text"
          name="project"
          value={formData.project}
          onChange={handleChange}
          placeholder="e.g., CC Review, CHP Claude Code, NEXT"
          className="w-full bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sindicato-charcoal/80 mb-2 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
            Work Date Range *
          </label>
          <input
            type="text"
            name="dateRange"
            required
            value={formData.dateRange}
            onChange={handleChange}
            placeholder="e.g., Jan 2024 - Mar 2024"
            className="w-full bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sindicato-charcoal/80 mb-2 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
            Amount Owed *
          </label>
          <div className="flex gap-2">
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="BRL">BRL</option>
              <option value="INR">INR</option>
            </select>
            <input
              type="number"
              name="amountOwed"
              required
              value={formData.amountOwed}
              onChange={handleChange}
              placeholder="0.00"
              className="flex-1 bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sindicato-charcoal/80 mb-2 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
          Unanswered Contact Attempts *
        </label>
        <input
          type="number"
          name="contactAttempts"
          required
          value={formData.contactAttempts}
          onChange={handleChange}
          placeholder="How many times did you try to contact them?"
          className="w-full bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sindicato-charcoal/80 mb-2 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
          Your Story (100-500 words) *
        </label>
        <textarea
          name="story"
          required
          rows={6}
          value={formData.story}
          onChange={handleChange}
          placeholder="Describe what happened in your own words..."
          className="w-full bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors resize-none"
        />
        <p className="text-sindicato-charcoal/40 text-xs mt-1">
          {formData.story.trim() ? `${formData.story.trim().split(/\s+/).filter(Boolean).length} words` : ""}
        </p>
      </div>

      <div>
        <label className="block text-sindicato-charcoal/80 mb-2 text-sm uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className="w-full bg-white border border-sindicato-charcoal/20 text-sindicato-charcoal p-3 focus:border-sindicato-bordeaux focus:outline-none transition-colors"
        />
        <p className="text-sindicato-charcoal/40 text-xs mt-1">
          Your email is never displayed publicly. An anonymous alias is generated for communication.
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-sindicato-charcoal/10">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="optInSolicitor"
            id="optInSolicitor"
            checked={formData.optInSolicitor}
            onChange={handleChange}
            className="mt-1 w-5 h-5 accent-sindicato-bordeaux"
          />
          <label htmlFor="optInSolicitor" className="text-sindicato-charcoal/70 text-sm">
            I consent to be contacted by labor law professionals if a collective case is opened
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="optInCollective"
            id="optInCollective"
            checked={formData.optInCollective}
            onChange={handleChange}
            className="mt-1 w-5 h-5 accent-sindicato-bordeaux"
          />
          <label htmlFor="optInCollective" className="text-sindicato-charcoal/70 text-sm">
            I consent to join collective legal action if one is organised
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="optInCompanyNotify"
            id="optInCompanyNotify"
            checked={formData.optInCompanyNotify}
            onChange={handleChange}
            className="mt-1 w-5 h-5 accent-sindicato-bordeaux"
          />
          <label htmlFor="optInCompanyNotify" className="text-sindicato-charcoal/70 text-sm">
            Notify the company about this case (recommended)
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="attested"
            id="attested"
            checked={formData.attested ? true : false}
            onChange={() => setFormData((prev) => ({ ...prev, attested: !prev.attested }))}
            className="mt-1 w-5 h-5 accent-sindicato-bordeaux"
          />
          <label htmlFor="attested" className="text-sindicato-charcoal/70 text-sm">
            I confirm this account is truthful and based on my personal experience *
          </label>
        </div>
      </div>

      <Turnstile
        ref={turnstileRef}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
        onSuccess={onTurnstileSuccess}
        options={{
          theme: "light",
          size: "invisible",
          execution: "execute",
        }}
      />

      <button
        type="submit"
        disabled={isSubmitting || !formData.attested}
        className="w-full bg-sindicato-bordeaux text-white py-4 font-bold uppercase tracking-wider hover:bg-sindicato-bordeaux-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-barlow)]"
      >
        {isSubmitting ? "Submitting..." : "Submit Case"}
      </button>
    </form>
  );
}
