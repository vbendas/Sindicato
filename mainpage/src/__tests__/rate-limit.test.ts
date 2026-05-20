import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/auth/rate-limit";

describe("rateLimit", () => {
  it("allows first request", () => {
    const result = rateLimit(`allow-first-${Date.now()}`);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it("allows up to 5 requests", () => {
    const key = `allow-five-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key).allowed).toBe(true);
    }
  });

  it("blocks the 6th request", () => {
    const key = `block-six-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      rateLimit(key);
    }
    const result = rateLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("different keys are independent", () => {
    const keyA = `indep-a-${Date.now()}`;
    const keyB = `indep-b-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      rateLimit(keyA);
    }
    expect(rateLimit(keyA).allowed).toBe(false);
    expect(rateLimit(keyB).allowed).toBe(true);
  });

  it("returns retryAfterMs less than or equal to window", () => {
    const key = `retry-ms-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      rateLimit(key);
    }
    const result = rateLimit(key);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(60000);
  });

  it("allows a new key after another was blocked", () => {
    const blockedKey = `blocked-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      rateLimit(blockedKey);
    }
    expect(rateLimit(blockedKey).allowed).toBe(false);

    const freshKey = `fresh-${Date.now()}`;
    expect(rateLimit(freshKey).allowed).toBe(true);
  });
});
