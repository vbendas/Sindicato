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
  const isDevOrTest = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  if (!redis) {
    if (isDevOrTest) {
      return { allowed: true, retryAfterMs: 0 };
    } else {
      console.warn("Redis not configured - rate limiting in fail-closed mode");
      return { allowed: false, retryAfterMs: 60_000 };
    }
  }

  try {
    const redisKey = `rate_limit_${key}`;
    const windowSeconds = Math.ceil(windowMs / 1000);

    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
      return { allowed: true, retryAfterMs: 0 };
    }

    if (count > maxAttempts) {
      const ttl = await redis.ttl(redisKey);
      const retryAfterMs = ttl > 0 ? ttl * 1000 : windowMs;
      return { allowed: false, retryAfterMs };
    }

    return { allowed: true, retryAfterMs: 0 };
  } catch (error) {
    console.error("Rate limit error:", error);
    if (process.env.NODE_ENV === "production") {
      return { allowed: false, retryAfterMs: 60_000 };
    }
    return { allowed: true, retryAfterMs: 0 };
  }
}
