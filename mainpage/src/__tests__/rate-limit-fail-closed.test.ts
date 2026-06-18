import { describe, it, expect, vi, beforeEach } from "vitest";

describe("rateLimit fail-closed on Redis errors", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("denies requests when Redis throws in production", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    vi.stubEnv("NODE_ENV", "production");

    const getMock = vi.fn().mockRejectedValue(new Error("Redis down"));

    vi.doMock("@upstash/redis", () => ({
      Redis: class MockRedis {
        get = getMock;
        setex = vi.fn().mockRejectedValue(new Error("Redis down"));
        incr = vi.fn().mockRejectedValue(new Error("Redis down"));
      },
    }));

    const { rateLimit } = await import("@/lib/auth/rate-limit");
    const result = await rateLimit("test-key");

    expect(result.allowed).toBe(false);
  });

  it("allows requests when Redis throws in test mode", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    vi.stubEnv("NODE_ENV", "test");

    const getMock = vi.fn().mockRejectedValue(new Error("Redis down"));

    vi.doMock("@upstash/redis", () => ({
      Redis: class MockRedis {
        get = getMock;
        setex = vi.fn().mockRejectedValue(new Error("Redis down"));
        incr = vi.fn().mockRejectedValue(new Error("Redis down"));
      },
    }));

    const { rateLimit } = await import("@/lib/auth/rate-limit");
    const result = await rateLimit("test-key");

    expect(result.allowed).toBe(true);
  });
});
