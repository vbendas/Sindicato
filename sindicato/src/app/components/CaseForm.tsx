"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface CaseFormProps {
  onSuccess: () => void;
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

export default function CaseForm({ onSuccess }: CaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [strengthEval, setStrengthEval] = useState<StrengthEvaluation | null>(null);
  const [strengthLoading, setStrengthLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    country: "",
    projects: "",
    dateRange: "",
    amountOwed: "",
    currency: "EUR",
    contactAttempts: "",
    story: "",
    email: "",
    consentLegal: false,
    consentCollective: false,
    attestation: false,
    claimTypes: {
      unpaidWages: false,
      unfairPractices: false,
      retaliation: false,
      other: false,
    },
    otherDescription: "",
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

  const handleClaimTypeChange = (claimType: string) => {
    setFormData((prev) => ({
      ...prev,
      claimTypes: {
        ...prev.claimTypes,
        [claimType]: !prev.claimTypes[claimType as keyof typeof prev.claimTypes],
      },
    }));
  };

  const getActiveClaimTypes = () =>
    Object.entries(formData.claimTypes)
      .filter(([, v]) => v)
      .map(([k]) => k);

  const handleAiHelp = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/writing-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.displayName,
          country: formData.country,
          projects: formData.projects,
          dateRange: formData.dateRange,
          amountOwed: formData.amountOwed,
          currency: formData.currency,
          contactAttempts: Number(formData.contactAttempts),
          claimTypes: getActiveClaimTypes(),
          rawStory: formData.story,
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setAiSuggestion(data.data.suggestion);
        setShowAiHelper(true);
      }
    } catch {
    } finally {
      setAiLoading(false);
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
          projects: formData.projects,
          dateRange: formData.dateRange,
          amountOwed: formData.amountOwed,
          currency: formData.currency,
          contactAttempts: Number(formData.contactAttempts),
          claimTypes: getActiveClaimTypes(),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.attestation) {
      setError("You must confirm that your account is truthful and based on your personal experience.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit case");
      }

      setIsSubmitted(true);
      fetchCaseStrength();
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <h3 className="text-2xl font-bold text-sindicato-cream mb-4">
            Case Submitted Successfully
          </h3>
          <p className="text-sindicato-cream/70">
            Thank you for sharing your story. Your case will be reviewed and published shortly.
          </p>
        </div>

        <div className="border border-sindicato-cream/20 p-6 torn-edge">
          <h4 className="text-lg font-bold text-sindicato-cream mb-4 font-heading">
            Case Strength Analysis
          </h4>

          {strengthLoading && (
            <div className="flex items-center gap-2 text-sindicato-cream/60">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Analyzing your case...</span>
            </div>
          )}

          {strengthEval && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-sindicato-orange">
                  {strengthEval.score}/{strengthEval.maxScore}
                </span>
                <div className="flex-1 h-3 bg-sindicato-cream/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(strengthEval.score / strengthEval.maxScore) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-sindicato-orange rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {strengthEval.elements.map((el, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-sm mt-0.5 ${el.passed ? "text-green-400" : "text-red-400"}`}>
                      {el.passed ? "\u2713" : "\u2717"}
                    </span>
                    <div>
                      <span className="text-sindicato-cream/80 text-sm font-medium">{el.name}</span>
                      <p className="text-sindicato-cream/50 text-xs">{el.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sindicato-cream/60 text-sm border-t border-sindicato-cream/10 pt-3">
                {strengthEval.summary}
              </p>
            </motion.div>
          )}

          {!strengthLoading && !strengthEval && (
            <p className="text-sindicato-cream/40 text-sm">Case analysis unavailable.</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="bg-sindicato-red/20 border border-sindicato-red text-sindicato-cream p-4 torn-edge">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sindicato-cream/80 mb-2 text-sm uppercase tracking-wider">
            Display Name *
          </label>
          <input
            type="text"
            name="displayName"
            required
            value={formData.displayName}
            onChange={handleChange}
            placeholder="First name or pseudonym"
            className="w-full bg-sindicato-cream/5 border border-sindicato-cream/20 text-sindicato-cream p-3 focus:border-sindicato-red focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sindicato-cream/80 mb-2 text-sm uppercase tracking-wider">
            Country *
          </label>
          <input
            type="text"
            name="country"
            required
            value={formData.country}
            onChange={handleChange}
            placeholder="Your country"
            className="w-full bg-sindicato-cream/5 border border-sindicato-cream/20 text-sindicato-cream p-3 focus:border-sindicato-red focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sindicato-cream/80 mb-2 text-sm uppercase tracking-wider">
          Project(s) Worked On *
        </label>
        <input
          type="text"
          name="projects"
          required
          value={formData.projects}
          onChange={handleChange}
          placeholder="e.g., CC Review, CHP Claude Code, NEXT"
          className="w-full bg-sindicato-cream/5 border border-sindicato-cream/20 text-sindicato-cream p-3 focus:border-sindicato-red focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sindicato-cream/80 mb-2 text-sm uppercase tracking-wider">
            Work Date Range *
          </label>
          <input
            type="text"
            name="dateRange"
            required
            value={formData.dateRange}
            onChange={handleChange}
            placeholder="e.g., Jan 2024 - Mar 2024"
            className="w-full bg-sindicato-cream/5 border border-sindicato-cream/20 text-sindicato-cream p-3 focus:border-sindicato-red focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sindicato-cream/80 mb-2 text-sm uppercase tracking-wider">
            Amount Owed *
          </label>
          <div className="flex gap-2">
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="bg-sindicato-cream/5 border border-sindicato-cream/20 text-sindicato-cream p-3 focus:border-sindicato-red focus:outline-none transition-colors"
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
              className="flex-1 bg-sindicato-cream/5 border border-sindicato-cream/20 text-sindicato-cream p-3 focus:border-sindicato-red focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sindicato-cream/80 mb-2 text-sm uppercase tracking-wider">
          Unanswered Contact Attempts *
        </label>
        <input
          type="number"
          name="contactAttempts"
          required
          value={formData.contactAttempts}
          onChange={handleChange}
          placeholder="How many times did you try to contact them?"
          className="w-full bg-sindicato-cream/5 border border-sindicato-cream/20 text-sindicato-cream p-3 focus:border-sindicato-red focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sindicato-cream/80 mb-2 text-sm uppercase tracking-wider">
          Claim Type(s) *
        </label>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="unpaidWages"
              checked={formData.claimTypes.unpaidWages}
              onChange={() => handleClaimTypeChange("unpaidWages")}
              className="mt-1 w-5 h-5 accent-sindicato-red"
            />
            <label htmlFor="unpaidWages" className="text-sindicato-cream/70 text-sm">
              Unpaid wages
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="unfairPractices"
              checked={formData.claimTypes.unfairPractices}
              onChange={() => handleClaimTypeChange("unfairPractices")}
              className="mt-1 w-5 h-5 accent-sindicato-red"
            />
            <label htmlFor="unfairPractices" className="text-sindicato-cream/70 text-sm">
              Unfair practices
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="retaliation"
              checked={formData.claimTypes.retaliation}
              onChange={() => handleClaimTypeChange("retaliation")}
              className="mt-1 w-5 h-5 accent-sindicato-red"
            />
            <label htmlFor="retaliation" className="text-sindicato-cream/70 text-sm">
              Retaliation
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="other"
              checked={formData.claimTypes.other}
              onChange={() => handleClaimTypeChange("other")}
              className="mt-1 w-5 h-5 accent-sindicato-red"
            />
            <label htmlFor="other" className="text-sindicato-cream/70 text-sm">
              Other
            </label>
          </div>

          {formData.claimTypes.other && (
            <div className="mt-2">
              <input
                type="text"
                name="otherDescription"
                value={formData.otherDescription}
                onChange={handleChange}
                placeholder="Please describe the nature of your claim"
                className="w-full bg-sindicato-cream/5 border border-sindicato-cream/20 text-sindicato-cream p-3 focus:border-sindicato-red focus:outline-none transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sindicato-cream/80 text-sm uppercase tracking-wider">
            Your Story (100-500 words) *
          </label>
          {formData.story.length >= 50 && !showAiHelper && (
            <button
              type="button"
              onClick={handleAiHelp}
              disabled={aiLoading}
              className="text-xs bg-sindicato-orange/20 text-sindicato-orange px-3 py-1 hover:bg-sindicato-orange/30 transition-colors disabled:opacity-50 font-button uppercase tracking-wider"
            >
              {aiLoading ? "Analyzing..." : "Help me express this clearly"}
            </button>
          )}
        </div>
        <textarea
          name="story"
          required
          rows={6}
          value={formData.story}
          onChange={handleChange}
          placeholder="Describe what happened in your own words..."
          className="w-full bg-sindicato-cream/5 border border-sindicato-cream/20 text-sindicato-cream p-3 focus:border-sindicato-red focus:outline-none transition-colors resize-none"
        />

        {aiLoading && (
          <div className="mt-3 flex items-center gap-2 text-sindicato-cream/60">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Generating suggestion...</span>
          </div>
        )}

        {showAiHelper && aiSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 border border-sindicato-orange/30 bg-sindicato-orange/5 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sindicato-orange text-xs uppercase tracking-wider font-button">
                AI Suggestion
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, story: aiSuggestion }));
                    setShowAiHelper(false);
                    setAiSuggestion(null);
                  }}
                  className="text-xs bg-sindicato-red text-sindicato-cream px-3 py-1 hover:bg-sindicato-red/80 transition-colors font-button"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAiHelper(false);
                    setAiSuggestion(null);
                  }}
                  className="text-xs bg-sindicato-cream/10 text-sindicato-cream/60 px-3 py-1 hover:bg-sindicato-cream/20 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <p className="text-sindicato-cream/80 text-sm whitespace-pre-wrap">{aiSuggestion}</p>
            <p className="text-sindicato-cream/40 text-xs mt-3">
              AI-assisted text. This was generated with the help of AI to improve clarity. The facts and claims remain the worker&apos;s own. Always verify independently.
            </p>
          </motion.div>
        )}
      </div>

      <div>
        <label className="block text-sindicato-cream/80 mb-2 text-sm uppercase tracking-wider">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className="w-full bg-sindicato-cream/5 border border-sindicato-cream/20 text-sindicato-cream p-3 focus:border-sindicato-red focus:outline-none transition-colors"
        />
        <p className="text-sindicato-cream/40 text-xs mt-1">
          Your email will be partially redacted in public (e.g., v*****@g***.com)
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-sindicato-cream/10">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="consentLegal"
            id="consentLegal"
            checked={formData.consentLegal}
            onChange={handleChange}
            className="mt-1 w-5 h-5 accent-sindicato-red"
          />
          <label htmlFor="consentLegal" className="text-sindicato-cream/70 text-sm">
            I consent to be contacted by labor law professionals if a collective case is opened
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="consentCollective"
            id="consentCollective"
            checked={formData.consentCollective}
            onChange={handleChange}
            className="mt-1 w-5 h-5 accent-sindicato-red"
          />
          <label htmlFor="consentCollective" className="text-sindicato-cream/70 text-sm">
            I consent to join collective legal action if one is organised
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="attestation"
            id="attestation"
            checked={formData.attestation}
            onChange={handleChange}
            className="mt-1 w-5 h-5 accent-sindicato-red"
          />
          <label htmlFor="attestation" className="text-sindicato-cream/70 text-sm">
            I confirm this account is truthful and based on my personal experience *
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-sindicato-red text-sindicato-cream py-4 font-bold uppercase tracking-wider hover:bg-sindicato-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed torn-edge font-button"
      >
        {isSubmitting ? "Submitting..." : "Submit Case"}
      </button>
    </form>
  );
}
