/**
 * Request validation middleware
 */

/**
 * Validate UUID format
 */
export function isValidUUID(str) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Sanitize message content
 * Strips HTML tags, removes null bytes, limits special characters
 */
export function sanitizeMessage(message) {
  // Remove null bytes
  let sanitized = message.replace(/\0/g, '');

  // Strip HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Validate conversation ID in request params
 */
export function validateConversationId(req, res, next) {
  const { id } = req.params;

  if (!id || !isValidUUID(id)) {
    return res.status(400).json({
      error: 'Invalid conversation ID format',
      code: 'INVALID_ID',
    });
  }

  next();
}

/**
 * Validate chat request body
 */
export function validateChatRequest(req, res, next) {
  const { message, conversationId } = req.body;

  // Validate message
  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Message is required and must be a string',
      code: 'INVALID_MESSAGE',
    });
  }

  // Security checks before sanitization
  if (message.includes('\0')) {
    return res.status(400).json({
      error: 'Invalid characters in message',
      code: 'INVALID_MESSAGE',
    });
  }

  // Check for excessive newlines (potential DoS)
  const newlineCount = (message.match(/\n/g) || []).length;
  if (newlineCount > 1000) {
    return res.status(400).json({
      error: 'Message contains too many line breaks',
      code: 'INVALID_MESSAGE',
    });
  }

  // Check for control characters (except \n, \r, \t)
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(message)) {
    return res.status(400).json({
      error: 'Invalid control characters in message',
      code: 'INVALID_MESSAGE',
    });
  }

  const sanitizedMessage = sanitizeMessage(message);

  if (sanitizedMessage.length === 0) {
    return res.status(400).json({
      error: 'Message cannot be empty',
      code: 'INVALID_MESSAGE',
    });
  }

  if (sanitizedMessage.length > 100000) {
    return res.status(400).json({
      error: 'Message must be between 1 and 100000 characters',
      code: 'INVALID_MESSAGE',
    });
  }

  // Validate conversationId if provided
  if (conversationId && !isValidUUID(conversationId)) {
    return res.status(400).json({
      error: 'Invalid conversation ID format',
      code: 'INVALID_ID',
    });
  }

  // Store sanitized message
  req.body.message = sanitizedMessage;

  next();
}

/**
 * Validate conversation create/update body
 */
export function validateConversationBody(req, res, next) {
  const { title } = req.body;

  // If title is provided, validate it
  if (title !== undefined) {
    if (typeof title !== 'string') {
      return res.status(400).json({
        error: 'Title must be a string',
        code: 'INVALID_TITLE',
      });
    }

    // Security check for title
    if (title.includes('\0') || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(title)) {
      return res.status(400).json({
        error: 'Invalid characters in title',
        code: 'INVALID_TITLE',
      });
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0 || trimmedTitle.length > 100) {
      return res.status(400).json({
        error: 'Title must be between 1 and 100 characters',
        code: 'INVALID_TITLE',
      });
    }

    // Strip HTML from title
    req.body.title = trimmedTitle.replace(/<[^>]*>/g, '');
  }

  next();
}
