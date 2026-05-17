"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface CaseFormProps {
  onSuccess: () => void;
}

export default function CaseForm({ onSuccess }: CaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

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
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err) {
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
        className="text-center py-12"
      >
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
        <label className="block text-sindicato-cream/80 mb-2 text-sm uppercase tracking-wider">
          Your Story (100-500 words) *
        </label>
        <textarea
          name="story"
          required
          rows={6}
          value={formData.story}
          onChange={handleChange}
          placeholder="Describe what happened in your own words..."
          className="w-full bg-sindicato-cream/5 border border-sindicato-cream/20 text-sindicato-cream p-3 focus:border-sindicato-red focus:outline-none transition-colors resize-none"
        />
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
