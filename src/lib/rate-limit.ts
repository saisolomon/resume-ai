// Simple in-memory rate limiter using a sliding window
// Suitable for single-instance deployments

const store = new Map<string, number[]>();

/**
 * Check if a request is allowed under the rate limit.
 * @param key - Unique identifier (e.g., "chat:192.168.1.1")
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const timestamps = store.get(key) ?? [];

  // Remove expired timestamps
  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= limit) {
    store.set(key, valid);
    return false;
  }

  valid.push(now);
  store.set(key, valid);

  // Periodic cleanup: remove keys with no recent activity
  if (store.size > 10000) {
    for (const [k, v] of store) {
      if (v.every((t) => now - t >= windowMs)) {
        store.delete(k);
      }
    }
  }

  return true;
}
