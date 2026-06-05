"use client";

import { useState, useMemo, useEffect } from "react";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n";

interface DonateClientProps {
  locale: string;
  stripePublishableKey: string | null;
}

const PRESET_AMOUNTS_EUR = [5, 10, 25, 50, 100] as const;
const MIN_CUSTOM_EUR = 1;
const MAX_CUSTOM_EUR = 10_000;

type Mode = "preset" | "custom";

export default function DonateClient({ locale, stripePublishableKey }: DonateClientProps) {
  const t = useT();

  const [mode, setMode] = useState<Mode>("preset");
  const [presetEur, setPresetEur] = useState<number>(25);
  const [customEur, setCustomEur] = useState<string>("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const stripePromise = useMemo<Promise<StripeJs | null> | null>(() => {
    if (!stripePublishableKey) return null;
    return loadStripe(stripePublishableKey);
  }, [stripePublishableKey]);

  useEffect(() => {
    if (clientSecret) {
      // Reset scroll to top of the form when checkout mounts
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [clientSecret]);

  const customCents = useMemo(() => {
    const n = parseFloat(customEur.replace(",", "."));
    if (!isFinite(n) || n <= 0) return null;
    return Math.round(n * 100);
  }, [customEur]);

  const amountCents = mode === "preset" ? presetEur * 100 : customCents;

  function validate(): string | null {
    if (mode === "preset") return null;
    if (customEur.trim() === "") return t("donate.errorInvalid");
    if (customCents === null) return t("donate.errorInvalid");
    if (customCents < MIN_CUSTOM_EUR * 100) {
      return t("donate.errorMin").replace("{amount}", String(MIN_CUSTOM_EUR));
    }
    if (customCents > MAX_CUSTOM_EUR * 100) {
      return t("donate.errorMax");
    }
    if (donorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())) {
      return t("donate.errorInvalid");
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    if (amountCents === null || amountCents <= 0) {
      setError(t("donate.errorInvalid"));
      return;
    }
    if (!stripePromise) {
      setError("Payments are not configured.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amountCents,
          donorName: donorName.trim() || undefined,
          donorEmail: donorEmail.trim() || undefined,
          locale,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || t("donate.errorGeneric"));
      }
      setClientSecret(json.data.clientSecret);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("donate.errorGeneric");
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setClientSecret(null);
    setError(null);
  }

  if (!stripePublishableKey) {
    return (
      <div className="border border-white/10 p-8 sm:p-10">
        <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-widest font-[family-name:var(--font-barlow)] font-bold mb-4">
          {t("donate.comingSoonLabel")}
        </p>
        <p className="text-sindicato-warm-white/50 text-sm leading-relaxed">
          {t("donate.comingSoonBody")}{" "}
          <a
            href="mailto:hello@sindicato.report"
            className="text-sindicato-warm-white/70 hover:text-sindicato-warm-white transition-colors underline underline-offset-2"
          >
            hello@sindicato.report
          </a>
          .
        </p>
      </div>
    );
  }

  if (clientSecret) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border border-white/10 p-1 sm:p-2"
      >
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 text-right">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sindicato-warm-white/50 hover:text-sindicato-warm-white text-xs uppercase tracking-wider transition-colors font-[family-name:var(--font-barlow)] font-bold"
          >
            ← {t("donate.cancel")}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border border-white/10 p-8 sm:p-10"
    >
      <p className="text-sindicato-warm-white/40 text-xs uppercase tracking-widest font-[family-name:var(--font-barlow)] font-bold mb-6">
        {t("donate.formTitle")}
      </p>

      <div className="grid grid-cols-5 gap-2 mb-6">
        {PRESET_AMOUNTS_EUR.map((amount) => {
          const active = mode === "preset" && presetEur === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setMode("preset");
                setPresetEur(amount);
                setError(null);
              }}
              className={`h-14 text-base font-[family-name:var(--font-barlow)] font-bold border transition-colors ${
                active
                  ? "bg-sindicato-warm-white text-sindicato-bordeaux border-sindicato-warm-white"
                  : "bg-transparent text-sindicato-warm-white border-white/15 hover:border-white/40"
              }`}
              aria-pressed={active}
            >
              {amount}€
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <label
          htmlFor="donate-custom"
          className="block text-sindicato-warm-white/60 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold mb-2"
        >
          {t("donate.amountCustomLabel")}
        </label>
        <div className="flex items-center border border-white/15 focus-within:border-white/40 transition-colors">
          <span className="pl-3 text-sindicato-warm-white/50 text-sm">€</span>
          <input
            id="donate-custom"
            type="text"
            inputMode="decimal"
            value={customEur}
            onChange={(e) => {
              setMode("custom");
              setCustomEur(e.target.value);
              setError(null);
            }}
            placeholder={t("donate.amountCustomPlaceholder")}
            className="w-full bg-transparent text-sindicato-warm-white placeholder:text-sindicato-warm-white/30 px-2 py-3 text-base outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label
            htmlFor="donate-name"
            className="block text-sindicato-warm-white/60 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold mb-2"
          >
            {t("donate.nameLabel")}
          </label>
          <input
            id="donate-name"
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="w-full bg-transparent text-sindicato-warm-white placeholder:text-sindicato-warm-white/30 border border-white/15 focus:border-white/40 transition-colors px-3 py-2.5 text-sm outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="donate-email"
            className="block text-sindicato-warm-white/60 text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold mb-2"
          >
            {t("donate.emailLabel")}
          </label>
          <input
            id="donate-email"
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            className="w-full bg-transparent text-sindicato-warm-white placeholder:text-sindicato-warm-white/30 border border-white/15 focus:border-white/40 transition-colors px-3 py-2.5 text-sm outline-none"
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-300/90 text-sm mb-4"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={submitting}
        className="w-full h-14 bg-sindicato-warm-white text-sindicato-bordeaux font-[family-name:var(--font-barlow)] font-bold uppercase tracking-wider text-base hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? t("donate.processing") : t("donate.submit")}
      </button>

      <p className="text-sindicato-warm-white/40 text-xs leading-relaxed mt-4 text-center">
        {t("donate.securityNote")}
      </p>
    </motion.form>
  );
}
