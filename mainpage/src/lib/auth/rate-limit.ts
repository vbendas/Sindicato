import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function rateLimit(
  key: string,
  maxAttempts = MAX_ATTEMPTS,
  windowMs = WINDOW_MS
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  // In development or test, if Redis is not configured, allow all requests
  const isDevOrTest = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  if (!redis) {
    if (isDevOrTest) {
      // console.warn("Redis not configured - rate limiting disabled in development/test");
      return { allowed: true, retryAfterMs: 0 };
    } else {
      console.warn("Redis not configured - rate limiting in fail-closed mode");
      return { allowed: false, retryAfterMs: 60_000 };
    }
  }

  try {
    const now = Date.now();
    const resetAt = await redis.get<number>(`rate_limit_reset_${key}`);
    
    if (!resetAt || now > resetAt) {
      const newResetAt = now + windowMs;
      await redis.setex(`rate_limit_reset_${key}`, Math.ceil(windowMs / 1000), newResetAt);
      await redis.setex(`rate_limit_count_${key}`, Math.ceil(windowMs / 1000), 1);
      return { allowed: true, retryAfterMs: 0 };
    }

    const count = (await redis.get<number>(`rate_limit_count_${key}`)) || 0;
    
    if (count >= maxAttempts) {
      return { allowed: false, retryAfterMs: resetAt - now };
    }

    await redis.incr(`rate_limit_count_${key}`);
    return { allowed: true, retryAfterMs: 0 };
  } catch (error) {
    console.error("Rate limit error:", error);
    // In production, fail closed when Redis is unavailable. In dev/test, allow
    // so local development is not blocked.
    if (process.env.NODE_ENV === "production") {
      return { allowed: false, retryAfterMs: 60_000 };
    }
    return { allowed: true, retryAfterMs: 0 };
  }
}
