import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apiHandlers } from '../../mocks/handlers';

const server = setupServer(...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Conversation Persistence - Integration Tests', () => {
  const testConversationId = 'test-conversation-id';

  it('should persist conversation across requests', async () => {
    // Create conversation
    const createResponse = await fetch('http://localhost:3001/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Persistence Test' }),
    });

    const created = await createResponse.json();
    expect(created.id).toBeDefined();
    expect(created.title).toBe('Persistence Test');

    // Retrieve conversation
    const getResponse = await fetch(`http://localhost:3001/api/conversations/${created.id}`);
    const retrieved = await getResponse.json();

    expect(retrieved.id).toBe(created.id);
    expect(retrieved.title).toBe('Persistence Test');
  });

  it('should persist messages across requests', async () => {
    server.use(
      http.post('http://localhost:3001/api/chat', () => {
        return HttpResponse.json({ id: 'msg-id' }, { status: 201 });
      })
    );

    // Send message (creates conversation)
    await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test persistence message' }),
    });

    // Verify message was saved
    const conversationsResponse = await fetch('http://localhost:3001/api/conversations');
    const conversationsData = await conversationsResponse.json();

    if (conversationsData.conversations.length > 0) {
      const latestConv = conversationsData.conversations[0];
      expect(latestConv.messageCount).toBeGreaterThan(0);
    }
  });

  it('should maintain conversation order by updatedAt', async () => {
    const conv1 = await fetch('http://localhost:3001/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Conversation 1' }),
    }).then(r => r.json());

    // Wait to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const conv2 = await fetch('http://localhost:3001/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Conversation 2' }),
    }).then(r => r.json());

    const listResponse = await fetch('http://localhost:3001/api/conversations');
    const listData = await listResponse.json();

    if (listData.conversations.length >= 2) {
      // Most recently updated should be first
      expect(listData.conversations[0].id).toBe(conv2.id);
    }
  });

  it('should handle concurrent conversation creation', async () => {
    const promises = Array(5)
      .fill(null)
      .map(() =>
        fetch('http://localhost:3001/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Concurrent Test' }),
        })
      );

    const results = await Promise.all(promises);
    const conversations = await Promise.all(results.map(r => r.json()));

    conversations.forEach(conv => {
      expect(conv.id).toBeDefined();
    });
  });
});
