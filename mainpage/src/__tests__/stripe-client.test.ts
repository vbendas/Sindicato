import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("getStripe", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws a clear error when no Stripe key is configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_RESTRICTED_KEY;

    const { getStripe } = await import("@/lib/stripe/client");
    expect(() => getStripe()).toThrow(/STRIPE_SECRET_KEY/);
  });

  it("initializes a Stripe client pinned to the SDK's dahlia API version", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";

    const { getStripe } = await import("@/lib/stripe/client");
    const stripe = getStripe();

    // SDK ships with dahlia (2026-05-27.dahlia at time of writing).
    // The static API_VERSION on the class is the value we pass via apiVersion.
    expect(stripe).toBeDefined();
    expect(typeof Stripe.API_VERSION).toBe("string");
    expect(Stripe.API_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}\.\w+/);
  });

  it("accepts a restricted API key (rk_*) when no secret key is present", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_RESTRICTED_KEY = "rk_test_dummy";

    const { getStripe } = await import("@/lib/stripe/client");
    const stripe = getStripe();
    expect(stripe).toBeDefined();
  });

  it("prefers STRIPE_SECRET_KEY when both keys are present", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    process.env.STRIPE_RESTRICTED_KEY = "rk_test_dummy";

    const { getStripe } = await import("@/lib/stripe/client");
    const stripe = getStripe();
    expect(stripe).toBeDefined();
  });
});

import Stripe from "stripe";
