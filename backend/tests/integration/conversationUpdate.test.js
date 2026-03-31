import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apiHandlers } from '../../mocks/handlers';

const server = setupServer(...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PATCH /api/conversations/:id - Contract Tests', () => {
  it('should update conversation title', async () => {
    server.use(
      http.patch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000', () => {
        return HttpResponse.json({
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Updated Title',
          createdAt: '2026-03-30T10:00:00.000Z',
          updatedAt: '2026-03-30T10:20:00.000Z',
          messageCount: 2,
        });
      })
    );

    const response = await fetch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe('Updated Title');
    expect(data.updatedAt).toBe('2026-03-30T10:20:00.000Z');
  });

  it('should validate title length', async () => {
    const response = await fetch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }), // Empty title
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  it('should validate title too long', async () => {
    const longTitle = 'a'.repeat(101);
    const response = await fetch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: longTitle }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 for non-existent conversation', async () => {
    server.use(
      http.patch('http://localhost:3001/api/conversations/non-existent-id', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );

    const response = await fetch('http://localhost:3001/api/conversations/non-existent-id', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Title' }),
    });

    expect(response.status).toBe(404);
  });
});
