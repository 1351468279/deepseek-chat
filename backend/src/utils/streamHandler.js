/**
 * StreamHandler utilities for SSE (Server-Sent Events)
 */

/**
 * Format SSE event
 */
export function formatSSEEvent(data) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * Format SSE done event
 */
export function formatSSEDone() {
  return 'data: [DONE]\n\n';
}

/**
 * Format SSE error event
 */
export function formatSSEError(error) {
  return formatSSEEvent({ error: error.message || 'Unknown error' });
}

/**
 * Write SSE chunk to response
 */
export function writeSSEChunk(res, content) {
  res.write(formatSSEEvent({ content }));
}

/**
 * Write SSE done event
 */
export function writeSSEDone(res) {
  res.write(formatSSEDone());
}

/**
 * Write SSE error event
 */
export function writeSSError(res, error) {
  res.write(formatSSEError(error));
}

/**
 * Setup SSE response headers
 */
export function setupSSEHeaders(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
}

/**
 * Parse SSE line from GLM API
 */
export function parseSSELine(line) {
  if (!line.startsWith('data: ')) {
    return null;
  }

  const data = line.substring(6);

  if (data === '[DONE]') {
    return { done: true };
  }

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
