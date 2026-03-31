/**
 * Rate limiting middleware
 * Simple in-memory rate limiter for API endpoints
 */

// Store request timestamps by IP address
const requestStore = new Map();

/**
 * Clean up old entries from the request store
 * Removes entries older than the window size
 */
function cleanupStore(windowMs) {
  const now = Date.now();
  for (const [ip, timestamps] of requestStore.entries()) {
    // Remove timestamps older than the window
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    if (validTimestamps.length === 0) {
      requestStore.delete(ip);
    } else {
      requestStore.set(ip, validTimestamps);
    }
  }
}

/**
 * Create rate limiting middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {number} options.maxRequests - Maximum requests per window (default: 20)
 * @param {string} options.message - Error message (default: 'Too many requests')
 */
export function createRateLimiter(options = {}) {
  const {
    windowMs = 60000, // 1 minute
    maxRequests = 20,
    message = 'Too many requests, please try again later',
  } = options;

  // Run cleanup every minute
  setInterval(() => cleanupStore(windowMs), 60000);

  return function rateLimiter(req, res, next) {
    // Get client IP (considering proxy headers)
    const ip = req.ip ||
               req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.headers['x-real-ip'] ||
               'unknown';

    const now = Date.now();

    // Get existing timestamps for this IP
    let timestamps = requestStore.get(ip) || [];

    // Filter timestamps within the current window
    timestamps = timestamps.filter(t => now - t < windowMs);

    // Check if limit exceeded
    if (timestamps.length >= maxRequests) {
      const oldestRequest = timestamps[0];
      const resetTime = Math.ceil((oldestRequest + windowMs - now) / 1000);

      res.setHeader('Retry-After', resetTime);
      return res.status(429).json({
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: resetTime,
      });
    }

    // Add current request timestamp
    timestamps.push(now);
    requestStore.set(ip, timestamps);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - timestamps.length));
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

    next();
  };
}

/**
 * Pre-configured rate limiter for chat endpoint
 * 20 requests per minute
 */
export const chatRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 20,
  message: 'Too many chat requests. Please wait a moment before sending another message.',
});

/**
 * Pre-configured rate limiter for general API
 * 100 requests per minute
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  message: 'Too many API requests. Please slow down.',
});
