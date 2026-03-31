import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apiHandlers } from '../../mocks/handlers';

const server = setupServer(...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('DELETE /api/conversations/:id - Contract Tests', () => {
  it('should delete conversation and all messages', async () => {
    // Create conversation first
    server.use(
      http.post('http://localhost:3001/api/conversations', () => {
        return HttpResponse.json({
          id: 'delete-test-id',
          title: 'To Be Deleted',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 1,
        });
      })
    );

    const createResponse = await fetch('http://localhost:3001/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'To Be Deleted' }),
    });

    const conversation = await createResponse.json();

    // Delete conversation
    const deleteResponse = await fetch(`http://localhost:3001/api/conversations/${conversation.id}`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(204);

    // Verify it's gone
    const getResponse = await fetch(`http://localhost:3001/api/conversations/${conversation.id}`);
    expect(getResponse.status).toBe(404);
  });

  it('should return 404 for non-existent conversation', async () => {
    const response = await fetch('http://localhost:3001/api/conversations/non-existent-id', {
      method: 'DELETE',
    });

    expect(response.status).toBe(404);
  });

  it('should return 204 on successful delete', async () => {
    server.use(
      http.delete('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    const response = await fetch('http://localhost:3001/api/conversations/550e8400-e29b-41d4-a716-446655440000', {
      method: 'DELETE',
    });

    expect(response.status).toBe(204);
  });
});
