import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'os';
import { join } from 'path';
import { rmSync, existsSync } from 'fs';
import messageStore from '../../src/services/messageStore.js';

describe('messageStore Service', () => {
  const testDbPath = join(tmpdir(), `test-messages-${Date.now()}.json`);

  // Override the database path for testing
  const originalDbPath = process.env.DB_PATH;
  process.env.DB_PATH = testDbPath;

  beforeEach(async () => {
    // Clean up test database before each test
    if (existsSync(testDbPath)) {
      rmSync(testDbPath);
    }
  });

  afterEach(async () => {
    // Clean up test database after each test
    if (existsSync(testDbPath)) {
      rmSync(testDbPath);
    }
  });

  it('should create a message', async () => {
    const message = await messageStore.create({
      conversationId: 'test-conv-id',
      role: 'user',
      content: 'Hello, world!',
      timestamp: new Date().toISOString(),
    });

    expect(message).toBeDefined();
    expect(message.id).toBeDefined();
    expect(message.conversationId).toBe('test-conv-id');
    expect(message.role).toBe('user');
    expect(message.content).toBe('Hello, world!');
  });

  it('should find messages by conversation ID', async () => {
    const conversationId = 'test-conv-id';

    await messageStore.create({
      conversationId,
      role: 'user',
      content: 'Message 1',
      timestamp: new Date().toISOString(),
    });

    await messageStore.create({
      conversationId,
      role: 'assistant',
      content: 'Response 1',
      timestamp: new Date().toISOString(),
    });

    const messages = await messageStore.findByConversation(conversationId);

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toBe('Message 1');
    expect(messages[1].content).toBe('Response 1');
  });

  it('should return empty array for non-existent conversation', async () => {
    const messages = await messageStore.findByConversation('non-existent-id');
    expect(messages).toEqual([]);
  });

  it('should get history for GLM in correct order', async () => {
    const conversationId = 'test-conv-id';
    const now = new Date().toISOString();

    await messageStore.create({
      conversationId,
      role: 'user',
      content: 'First message',
      timestamp: now,
    });

    await messageStore.create({
      conversationId,
      role: 'assistant',
      content: 'First response',
      timestamp: now,
    });

    await messageStore.create({
      conversationId,
      role: 'user',
      content: 'Second message',
      timestamp: now,
    });

    const history = await messageStore.getHistoryForGLM(conversationId);

    expect(history).toHaveLength(3);
    expect(history[0]).toEqual({ role: 'user', content: 'First message' });
    expect(history[1]).toEqual({ role: 'assistant', content: 'First response' });
    expect(history[2]).toEqual({ role: 'user', content: 'Second message' });
  });

  it('should handle empty history for GLM', async () => {
    const history = await messageStore.getHistoryForGLM('non-existent-id');
    expect(history).toEqual([]);
  });

  it('should delete all messages for a conversation', async () => {
    const conversationId = 'test-conv-id';

    await messageStore.create({
      conversationId,
      role: 'user',
      content: 'Message 1',
      timestamp: new Date().toISOString(),
    });

    await messageStore.deleteByConversation(conversationId);

    const messages = await messageStore.findByConversation(conversationId);
    expect(messages).toEqual([]);
  });
});
