import { describe, it, expect, vi } from "vitest";
import { rateLimit } from "@/lib/auth/rate-limit";

describe("rateLimit", () => {
  // Note: These tests run with Redis not configured, so rate limiting is disabled
  // In production, Redis would be configured and these tests would behave differently
  
  it("allows first request (rate limiting disabled when Redis not configured)", async () => {
    const result = await rateLimit(`allow-first-${Date.now()}`);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it("allows requests even when exceeding limit (rate limiting disabled when Redis not configured)", async () => {
    const key = `allow-excess-${Date.now()}`;
    // Even with 10 requests (more than the 5 limit), all should be allowed
    for (let i = 0; i < 10; i++) {
      const result = await rateLimit(key);
      expect(result.allowed).toBe(true);
    }
  });

  it("returns zero retryAfterMs (rate limiting disabled when Redis not configured)", async () => {
    const key = `zero-retry-${Date.now()}`;
    // Even with multiple requests, retryAfterMs should remain 0
    for (let i = 0; i < 10; i++) {
      const result = await rateLimit(key);
      expect(result.retryAfterMs).toBe(0);
    }
  });
});
