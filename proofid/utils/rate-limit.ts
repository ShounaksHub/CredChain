type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry) {
    store.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (now > entry.resetTime) {
    store.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count += 1;
  return { success: true, limit, remaining: limit - entry.count, resetTime: entry.resetTime };
}
