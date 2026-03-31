/**
 * API Client for backend communication
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Fetch wrapper with error handling
 */
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response;
}

/**
 * Stream chat request with SSE
 */
async function streamChatRequest(
  request: {
    message: string;
    conversationId?: string;
  },
  onChunk: (chunk: { content?: string; error?: string }) => void,
  onError: (error: string) => void,
  onComplete: () => void
): Promise<void> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    onError(error.error || `HTTP ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError('No response body');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data === '[DONE]') {
            onComplete();
            return;
          }
          try {
            const chunk = JSON.parse(data) as { content?: string; error?: string };
            if (chunk.error) {
              onError(chunk.error);
              return;
            }
            if (chunk.content) {
              onChunk(chunk);
            }
          } catch {
            // Ignore JSON parse errors for incomplete chunks
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Stream error');
  } finally {
    reader.releaseLock();
  }
}

/**
 * GET request
 */
async function get<T>(endpoint: string): Promise<T> {
  const response = await fetchAPI(endpoint, { method: 'GET' });
  return response.json() as Promise<T>;
}

/**
 * POST request
 */
async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await fetchAPI(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json() as Promise<T>;
}

/**
 * PATCH request
 */
async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await fetchAPI(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json() as Promise<T>;
}

/**
 * DELETE request
 */
async function del(endpoint: string): Promise<void> {
  await fetchAPI(endpoint, { method: 'DELETE' });
}

export const apiClient = {
  fetchAPI,
  streamChatRequest,
  get,
  post,
  patch,
  delete: del,
};

/**
 * AI Provider API
 */
export const aiProviderAPI = {
  getCurrentProvider: () => get<{ provider: string }>('/ai/provider'),
  getProviders: () => get<{
    providers: Array<{ id: string; name: string; model: string }>;
    current: string;
  }>('/ai/providers'),
};
