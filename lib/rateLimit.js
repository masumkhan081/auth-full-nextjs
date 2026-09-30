/**
 * Simple in-memory rate limiter.
 * Tracks attempts by a key (e.g., IP address) within a sliding time window.
 * No Redis needed — suitable for single-instance deployments.
 *
 * Limitation: resets on server restart. For production clusters, use Redis.
 */

const store = new Map();

/**
 * @param {string} key - Identifier to rate limit (e.g., IP address)
 * @param {number} maxAttempts - Max allowed attempts within the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
 */
export const checkRateLimit = (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    store.set(key, { attempts: [now] });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterMs: 0 };
  }

  // Filter out attempts outside the window
  record.attempts = record.attempts.filter((t) => now - t < windowMs);

  if (record.attempts.length >= maxAttempts) {
    const oldestAttempt = record.attempts[0];
    const retryAfterMs = windowMs - (now - oldestAttempt);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  record.attempts.push(now);
  return { allowed: true, remaining: maxAttempts - record.attempts.length, retryAfterMs: 0 };
};

/**
 * Reset the rate limit for a key (e.g., after successful login).
 */
export const resetRateLimit = (key) => {
  store.delete(key);
};

// Periodic cleanup to prevent memory leaks (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    record.attempts = record.attempts.filter((t) => now - t < 15 * 60 * 1000);
    if (record.attempts.length === 0) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);
