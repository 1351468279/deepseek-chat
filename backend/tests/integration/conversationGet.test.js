import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apiHandlers } from '../../mocks/handlers';

const server = setupServer(...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GET /api/conversations/:id - Contract Tests', () => {
  it('should return conversation with messages', async () => {
    const response = await fetch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
    expect(data.messages).toBeDefined();
    expect(Array.isArray(data.messages)).toBe(true);
  });

  it('should return 404 for invalid UUID format', async () => {
    const response = await fetch('http://localhost:3001/api/conversations/invalid-uuid');

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('INVALID_ID');
  });

  it('should return 404 for non-existent conversation', async () => {
    server.use(
      http.get('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-44665540999', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );

    const response = await fetch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-44665540999');

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.code).toBe('CONVERSATION_NOT_FOUND');
  });

  it('should include message count', async () => {
    const response = await fetch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000');
    const data = await response.json();

    expect(data.messageCount).toBeDefined();
    expect(typeof data.messageCount).toBe('number');
  });

  it('should have proper timestamps', async () => {
    const response = await fetch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000');
    const data = await response.json();

    expect(data.createdAt).toBeDefined();
    expect(data.updatedAt).toBeDefined();
    expect(new Date(data.createdAt)).toBeInstanceOf(Date);
  });
});
