/**
 * Global error handling middleware for Express
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // GLM API errors
  if (err.status) {
    const status = err.status;
    const isRetryable = [429, 500, 503].includes(status);

    if (status === 401) {
      return res.status(500).json({
        error: 'AI service authentication failed',
        code: 'AI_AUTH_ERROR',
      });
    }

    if (status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMITED',
        retryAfter: 60,
      });
    }

    if (isRetryable) {
      return res.status(502).json({
        error: 'AI service temporarily unavailable',
        code: 'AI_SERVICE_ERROR',
      });
    }

    return res.status(status).json({
      error: err.message || 'AI service error',
      code: 'AI_SERVICE_ERROR',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message,
      code: 'VALIDATION_ERROR',
    });
  }

  // Database errors
  if (err.code === 'ENOENT') {
    return res.status(500).json({
      error: 'Database file not found',
      code: 'DATABASE_ERROR',
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
