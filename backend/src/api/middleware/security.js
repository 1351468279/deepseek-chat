/**
 * Security middleware
 * Provides security headers and additional protection
 */

/**
 * Security headers middleware
 * Adds security-related HTTP headers to all responses
 */
export function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS filter (browser-side)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (basic)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self';"
  );

  // Permissions policy (restricts browser features)
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS (HTTP Strict Transport Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

/**
 * Validate message content for security issues
 * Checks for common attack patterns
 */
export function validateMessageSecurity(message) {
  const securityChecks = [
    // Check for extremely long messages (DoS prevention)
    { test: () => message.length > 100000, message: 'Message exceeds maximum length' },

    // Check for null bytes
    { test: () => message.includes('\0'), message: 'Invalid characters in message' },

    // Check for excessive newlines (potential DoS)
    { test: () => (message.match(/\n/g) || []).length > 1000, message: 'Too many line breaks' },

    // Check for control characters (except \n, \r, \t)
    {
      test: () => /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(message),
      message: 'Invalid control characters',
    },
  ];

  for (const check of securityChecks) {
    if (check.test()) {
      return { valid: false, error: check.message };
    }
  }

  return { valid: true };
}

/**
 * Message security validation middleware
 */
export function validateMessageSecurityMiddleware(req, res, next) {
  const { message } = req.body;

  if (!message) {
    return next();
  }

  const securityResult = validateMessageSecurity(message);

  if (!securityResult.valid) {
    return res.status(400).json({
      error: securityResult.error,
      code: 'SECURITY_VIOLATION',
    });
  }

  next();
}

/**
 * IP-based rate limiting for abuse prevention
 * More aggressive than the standard rate limiter
 */
const abusiveIPs = new Map();

export function detectAbuse(req, res, next) {
  const ip = req.ip ||
             req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             'unknown';

  const now = Date.now();
  const abuseRecord = abusiveIPs.get(ip) || { count: 0, resetTime: now + 60000 };

  // Reset counter if window expired
  if (now > abuseRecord.resetTime) {
    abuseRecord.count = 0;
    abuseRecord.resetTime = now + 60000;
  }

  // Increment counter
  abuseRecord.count++;
  abusiveIPs.set(ip, abuseRecord);

  // Block if exceeded threshold (50 requests per minute)
  if (abuseRecord.count > 50) {
    return res.status(429).json({
      error: 'Too many requests. Please slow down.',
      code: 'ABUSE_DETECTED',
    });
  }

  next();
}

/**
 * Clean up old abuse records
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of abusiveIPs.entries()) {
    if (now > record.resetTime) {
      abusiveIPs.delete(ip);
    }
  }
}, 60000);
