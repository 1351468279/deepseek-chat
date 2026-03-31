import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'os';
import { join } from 'path';
import { rmSync, existsSync } from 'fs';
import conversationStore from '../../src/services/conversationStore.js';

describe('conversationStore Service', () => {
  const testDbPath = join(tmpdir(), `test-conversations-${Date.now()}.json`);

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

  it('should create a conversation', async () => {
    const conversation = await conversationStore.create({
      title: 'Test Conversation',
    });

    expect(conversation).toBeDefined();
    expect(conversation.id).toBeDefined();
    expect(conversation.title).toBe('Test Conversation');
    expect(conversation.messageCount).toBe(0);
    expect(conversation.createdAt).toBeDefined();
    expect(conversation.updatedAt).toBeDefined();
  });

  it('should find conversation by ID', async () => {
    const created = await conversationStore.create({
      title: 'Test Conversation',
    });

    const found = await conversationStore.findById(created.id);

    expect(found).toBeDefined();
    expect(found.id).toBe(created.id);
    expect(found.title).toBe('Test Conversation');
  });

  it('should return null for non-existent conversation', async () => {
    const found = await conversationStore.findById('non-existent-id');
    expect(found).toBeNull();
  });

  it('should find all conversations', async () => {
    await conversationStore.create({ title: 'Conversation 1' });
    await conversationStore.create({ title: 'Conversation 2' });
    await conversationStore.create({ title: 'Conversation 3' });

    const conversations = await conversationStore.findAll();

    expect(conversations).toHaveLength(3);
  });

  it('should return empty array when no conversations exist', async () => {
    const conversations = await conversationStore.findAll();
    expect(conversations).toEqual([]);
  });

  it('should update conversation title', async () => {
    const created = await conversationStore.create({
      title: 'Original Title',
    });

    const updated = await conversationStore.update(created.id, {
      title: 'Updated Title',
    });

    expect(updated.title).toBe('Updated Title');
    expect(updated.id).toBe(created.id);
  });

  it('should update conversation message count', async () => {
    const created = await conversationStore.create({
      title: 'Test Conversation',
    });

    await conversationStore.incrementMessageCount(created.id);
    const updated = await conversationStore.findById(created.id);

    expect(updated.messageCount).toBe(1);
  });

  it('should touch conversation timestamp', async () => {
    const created = await conversationStore.create({
      title: 'Test Conversation',
    });

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    await conversationStore.touch(created.id);
    const updated = await conversationStore.findById(created.id);

    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
      new Date(created.updatedAt).getTime()
    );
  });

  it('should delete conversation', async () => {
    const created = await conversationStore.create({
      title: 'Test Conversation',
    });

    await conversationStore.delete(created.id);

    const found = await conversationStore.findById(created.id);
    expect(found).toBeNull();
  });

  it('should handle deleting non-existent conversation', async () => {
    await expect(conversationStore.delete('non-existent-id')).resolves.not.toThrow();
  });

  it('should handle updating non-existent conversation', async () => {
    const result = await conversationStore.update('non-existent-id', {
      title: 'New Title',
    });
    expect(result).toBeNull();
  });
});
