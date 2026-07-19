import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Fallback memory cache if Redis is not configured (e.g., local dev)
const memoryCache = new Map();

// Types for limits
type LimitType = "auth" | "write" | "read";

// Redis client initialization (only if env vars are present)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Helper to get a config value with a default
 */
function getConfig(key: string, defaultVal: string): string {
  return process.env[key] || defaultVal;
}

/**
 * Parse window string to seconds, e.g. "60 s" -> 60
 */
function parseWindow(windowStr: string): number {
  const parts = windowStr.trim().split(/\s+/);
  if (parts.length > 0) {
    const val = parseInt(parts[0], 10);
    return isNaN(val) ? 60 : val;
  }
  return 60;
}

/**
 * Create a rate limiter instance (Redis or Memory)
 */
function createLimiter(
  reqCount: number,
  windowStr: string
) {
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(reqCount, windowStr as any),
      analytics: true,
      prefix: "credchain-rl",
    });
  }

  // Fallback to simple memory sliding window simulation
  const windowMs = parseWindow(windowStr) * 1000;
  return {
    limit: async (identifier: string) => {
      const now = Date.now();
      const entry = memoryCache.get(identifier);

      if (!entry || now > entry.resetTime) {
        memoryCache.set(identifier, { count: 1, resetTime: now + windowMs });
        return { success: true, limit: reqCount, remaining: reqCount - 1, reset: now + windowMs };
      }

      if (entry.count >= reqCount) {
        return { success: false, limit: reqCount, remaining: 0, reset: entry.resetTime };
      }

      entry.count += 1;
      return { success: true, limit: reqCount, remaining: reqCount - entry.count, reset: entry.resetTime };
    },
  };
}

// Instantiate our three distinct limiters
const limiters = {
  auth: createLimiter(
    parseInt(getConfig("RATE_LIMIT_AUTH_REQ", "5"), 10),
    getConfig("RATE_LIMIT_AUTH_WINDOW", "60 s")
  ),
  write: createLimiter(
    parseInt(getConfig("RATE_LIMIT_WRITE_REQ", "10"), 10),
    getConfig("RATE_LIMIT_WRITE_WINDOW", "60 s")
  ),
  read: createLimiter(
    parseInt(getConfig("RATE_LIMIT_READ_REQ", "100"), 10),
    getConfig("RATE_LIMIT_READ_WINDOW", "60 s")
  ),
};

export async function rateLimit(
  identifier: string,
  type: LimitType
): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
  try {
    const limiter = limiters[type];
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    
    if (!success) {
      console.warn(`[RateLimit] Violation detected for ${type} - ${identifier}`);
    }
    
    return { success, limit, remaining, resetTime: reset };
  } catch (error) {
    console.error(`[RateLimit] Error executing rate limit:`, error);
    // Fail open if Redis is down, to avoid breaking the app
    return { success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 };
  }
}

