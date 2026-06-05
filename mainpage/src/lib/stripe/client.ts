import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const secretKey =
    process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_RESTRICTED_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY (or STRIPE_RESTRICTED_KEY) environment variable is not set"
    );
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: Stripe.API_VERSION,
    typescript: true,
    maxNetworkRetries: 2,
  });

  return stripeInstance;
}
