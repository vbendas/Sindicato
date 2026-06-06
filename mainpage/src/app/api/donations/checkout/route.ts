import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { donations } from "@/lib/db/schema";
import { rateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, success, error } from "@/lib/utils/api";
import { getStripe } from "@/lib/stripe/client";
import { verifyTurnstileToken } from "@/lib/utils/turnstile";

const PRESET_AMOUNTS_CENTS = [500, 1000, 2500, 5000, 10000] as const;
const MIN_CUSTOM_CENTS = 100;
const MAX_CUSTOM_CENTS = 1_000_000;

const checkoutSchema = z.object({
  amountCents: z.number().int().positive(),
  donorEmail: z
    .string()
    .email()
    .max(255)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  donorName: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  locale: z.string().min(2).max(10),
  turnstileToken: z.string().optional(),
  returnTo: z
    .string()
    .max(255)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? null;

  const { allowed } = await rateLimit(`donate:${ip}`, 10, 60_000);
  if (!allowed) {
    return error("Too many requests. Please try again in a minute.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON", 400);
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return error("Invalid input", 400, parsed.error.flatten().fieldErrors);
  }

  const { amountCents, donorEmail, donorName, locale, turnstileToken, returnTo } =
    parsed.data;

  const isPreset = (PRESET_AMOUNTS_CENTS as readonly number[]).includes(
    amountCents
  );
  if (!isPreset) {
    if (amountCents < MIN_CUSTOM_CENTS) {
      return error(`Minimum donation is ${MIN_CUSTOM_CENTS / 100} EUR`, 400);
    }
    if (amountCents > MAX_CUSTOM_CENTS) {
      return error(`Maximum donation is ${MAX_CUSTOM_CENTS / 100} EUR`, 400);
    }
  }

  if (turnstileToken) {
    const verified = await verifyTurnstileToken(turnstileToken);
    if (!verified) {
      return error("Human verification failed. Please try again.", 400);
    }
  }

  if (
    !process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_RESTRICTED_KEY
  ) {
    return error("Donations are not configured. Please contact us.", 503);
  }

  let donationId: string;
  try {
    const [row] = await db
      .insert(donations)
      .values({
        donorEmail: donorEmail ?? null,
        donorName: donorName ?? null,
        amountCents,
        currency: "eur",
        status: "pending",
        locale,
        ipAddress: ip,
        userAgent,
      })
      .returning({ id: donations.id });
    if (!row) {
      throw new Error("Failed to create donation record");
    }
    donationId = row.id;
  } catch (e) {
    console.error("Failed to insert donation row:", e);
    return error("Could not start donation. Please try again.", 500);
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (request.nextUrl ? `${request.nextUrl.protocol}//${request.nextUrl.host}` : "");

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(
      {
        ui_mode: "embedded_page",
        mode: "payment",
        currency: "eur",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: amountCents,
              product_data: {
                name: "Donation to Sindicato",
                description:
                  "Voluntary contribution funding the Worker Support Fund.",
              },
            },
          },
        ],
        customer_email: donorEmail,
        metadata: {
          donationId,
          donorName: donorName ?? "",
        },
        payment_intent_data: {
          metadata: {
            donationId,
            donorName: donorName ?? "",
          },
        },
        return_url: `${baseUrl}/${locale}/donate/thanks?session_id={CHECKOUT_SESSION_ID}${returnTo && /^\/[a-z]{2}(\/.*)?$/.test(returnTo) ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`,
      },
      { idempotencyKey: donationId }
    );

    if (!session.client_secret || !session.id) {
      throw new Error("Stripe did not return a client secret");
    }

    await db
      .update(donations)
      .set({ stripeSessionId: session.id })
      .where(eq(donations.id, donationId));

    return success({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (e) {
    console.error("Stripe checkout session error:", e);
    return error("Could not create payment session. Please try again.", 500);
  }
}
