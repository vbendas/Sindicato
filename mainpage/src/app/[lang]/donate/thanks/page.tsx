import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getStripe } from "@/lib/stripe/client";
import type Stripe from "stripe";
import DonateThanksClient, { type DonateStatus } from "./DonateThanksClient";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

function formatAmount(cents: number | null, currency: string, locale: string) {
  if (cents === null) return null;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export default async function DonateThanksPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const { session_id } = await searchParams;

  let status: DonateStatus = "missing";
  let amountFormatted: string | null = null;
  let customerEmail: string | null = null;

  if (session_id) {
    try {
      const stripe = getStripe();
      const session: Stripe.Checkout.Session =
        await stripe.checkout.sessions.retrieve(session_id);
      const isPaid = session.payment_status === "paid";
      const isExpired = session.status === "expired";
      const currency = session.currency ?? "eur";
      const amountTotal = session.amount_total ?? null;
      amountFormatted = formatAmount(amountTotal, currency, locale);
      customerEmail =
        session.customer_details?.email ?? session.customer_email ?? null;
      if (isPaid) status = "completed";
      else if (isExpired) status = "missing";
      else status = "processing";
    } catch (e) {
      console.error("Failed to retrieve Stripe session:", e);
      status = "error";
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  return (
    <DonateThanksClient
      status={status}
      amountFormatted={amountFormatted}
      customerEmail={customerEmail}
      baseUrl={baseUrl}
    />
  );
}
