import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apiHandlers } from '../../mocks/handlers';

const server = setupServer(...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GET /api/conversations/:id/messages - Contract Tests', () => {
  it('should return messages for a conversation', async () => {
    const response = await fetch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000/messages');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.messages).toBeDefined();
    expect(Array.isArray(data.messages)).toBe(true);
  });

  it('should support pagination', async () => {
    const response = await fetch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000/messages?limit=10&offset=0');
    const data = await response.json();

    expect(data.messages.length).toBeLessThanOrEqual(10);
    expect(data.hasMore).toBeDefined();
    expect(data.total).toBeDefined();
  });

  it('should filter messages before a timestamp', async () => {
    const beforeTimestamp = new Date().toISOString();
    const response = await fetch(
      `http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000/messages?before=${beforeTimestamp}`
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    data.messages.forEach(msg => {
      expect(msg.timestamp).toBeLessThan(beforeTimestamp);
    });
  });

  it('should return 404 for non-existent conversation', async () => {
    server.use(
      http.get('http://localhost:3001/api/conversations/non-existent-id/messages', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );

    const response = await fetch('http://localhost:3001/api/conversations/non-existent-id/messages');

    expect(response.status).toBe(404);
  });

  it('should handle empty message list', async () => {
    server.use(
      http.get('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000/messages', () => {
        return HttpResponse.json({ messages: [], total: 0, hasMore: false });
      })
    );

    const response = await fetch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000/messages');
    const data = await response.json();

    expect(data.messages).toEqual([]);
    expect(data.total).toBe(0);
    expect(data.hasMore).toBe(false);
  });
});
