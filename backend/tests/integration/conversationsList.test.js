import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apiHandlers } from '../../mocks/handlers';

// Setup MSW server
const server = setupServer(...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GET /api/conversations - Contract Tests', () => {
  it('should return list of conversations', async () => {
    const response = await fetch('http://localhost:3001/api/conversations');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversations).toBeDefined();
    expect(Array.isArray(data.conversations)).toBe(true);
    expect(data.total).toBeDefined();
  });

  it('should support pagination with limit and offset', async () => {
    const response = await fetch('http://localhost:3001/api/conversations?limit=10&offset=0');
    const data = await response.json();

    expect(data.conversations.length).toBeLessThanOrEqual(10);
  });

  it('should include last message preview', async () => {
    const response = await fetch('http://localhost:3001/api/conversations');
    const data = await response.json();

    if (data.conversations.length > 0) {
      expect(data.conversations[0].lastMessage).toBeDefined();
    }
  });

  it('should return 404 for non-existent conversation', async () => {
    server.use(
      http.get('/api/conversations/non-existent-id', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );

    const response = await fetch('http://localhost:3001/api/conversations/non-existent-id');

    expect(response.status).toBe(404);
  });

  it('should handle empty database', async () => {
    server.use(
      http.get('/api/conversations', () => {
        return HttpResponse.json({ conversations: [], total: 0 });
      })
    );

    const response = await fetch('http://localhost:3001/api/conversations');
    const data = await response.json();

    expect(data.conversations).toEqual([]);
    expect(data.total).toBe(0);
  });
});
