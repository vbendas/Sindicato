import { NextRequest } from "next/server";
import { eq, and, ne } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db/client";
import { donations } from "@/lib/db/schema";
import { getStripe } from "@/lib/stripe/client";
import { sendTemplateEmail } from "@/lib/email/send";
import DonationReceiptEmail from "@/lib/email/templates/donation-receipt";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

function formatAmount(cents: number, currency: string, locale?: string) {
  try {
    return new Intl.NumberFormat(locale || "en", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    logger.error("STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook not configured", { status: 503 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    logger.error("Stripe webhook signature verification failed", { message });
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCompleted(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleExpired(session);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleFailed(session);
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const donationId = pi.metadata?.donationId;
        if (donationId) {
          await db
            .update(donations)
            .set({ status: "failed" })
            .where(eq(donations.id, donationId));
        }
        break;
      }
      default:
        // Unhandled event types are explicitly acknowledged to Stripe
        break;
    }
  } catch (err) {
    logger.error("Stripe webhook handler error", {
      eventType: event.type,
      error: err instanceof Error ? err.message : String(err),
    });
    // Returning 500 makes Stripe retry; we only do that for processing errors,
    // not for malformed payloads (those return 400 above).
    return new Response("Internal processing error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

async function handleCompleted(session: Stripe.Checkout.Session) {
  const donationId =
    session.metadata?.donationId ??
    (await resolveDonationIdBySession(session.id));

  if (!donationId) {
    logger.warn("checkout.session.completed with no donationId", {
      sessionId: session.id,
    });
    return;
  }

  const updates: Partial<typeof donations.$inferInsert> = {
    status: "completed",
    completedAt: new Date(),
  };
  if (typeof session.payment_intent === "string") {
    updates.stripePaymentIntentId = session.payment_intent;
  } else if (session.payment_intent?.id) {
    updates.stripePaymentIntentId = session.payment_intent.id;
  }
  if (session.customer_email && !session.metadata?.donorEmail) {
    updates.donorEmail = session.customer_email;
  }
  if (session.customer_details?.name) {
    updates.donorName = session.customer_details.name;
  }

  const [updated] = await db
    .update(donations)
    .set(updates)
    .where(and(eq(donations.id, donationId), ne(donations.status, "completed")))
    .returning();

  if (!updated) return;

  // Fetch the row for receipt fields
  const row = updated;

  if (row?.donorEmail) {
    try {
      const amountFormatted = formatAmount(
        row.amountCents,
        row.currency,
        row.locale || undefined
      );
      const date = new Intl.DateTimeFormat(row.locale || "en", {
        dateStyle: "long",
      }).format(row.completedAt ?? new Date());

      await sendTemplateEmail(
        row.donorEmail,
        "Thank you for supporting Sindicato",
        DonationReceiptEmail,
        {
          donorName: row.donorName ?? undefined,
          amountFormatted,
          date,
        }
      );
    } catch (e) {
      logger.error("Failed to send donation receipt email", {
        donationId,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }
}

async function handleExpired(session: Stripe.Checkout.Session) {
  const donationId =
    session.metadata?.donationId ??
    (await resolveDonationIdBySession(session.id));
  if (!donationId) return;
  await db
    .update(donations)
    .set({ status: "expired" })
    .where(eq(donations.id, donationId));
}

async function handleFailed(session: Stripe.Checkout.Session) {
  const donationId =
    session.metadata?.donationId ??
    (await resolveDonationIdBySession(session.id));
  if (!donationId) return;
  await db
    .update(donations)
    .set({ status: "failed" })
    .where(eq(donations.id, donationId));
}

async function resolveDonationIdBySession(
  sessionId: string | null
): Promise<string | null> {
  if (!sessionId) return null;
  const [row] = await db
    .select({ id: donations.id })
    .from(donations)
    .where(eq(donations.stripeSessionId, sessionId))
    .limit(1);
  return row?.id ?? null;
}
