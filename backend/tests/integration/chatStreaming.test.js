import { describe, it, expect, beforeAll, afterEach, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { glmHandlers } from '../mocks/glmApi.js';
import app from '../../src/server.js';

// Setup MSW server with GLM API mocks
const server = setupServer(...glmHandlers);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('POST /api/chat - Streaming Contract Tests', () => {
  it('should return streaming response with correct headers', async () => {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, GLM!' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    expect(response.headers.get('cache-control')).toBe('no-cache');
    expect(response.headers.get('connection')).toBe('keep-alive');
  });

  it('should stream content chunks', async () => {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test streaming' }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const chunks = [];

    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(line => line.startsWith('data:'));
        chunks.push(...lines);
      }
    }

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[chunks.length - 1]).toBe('data: [DONE]');
  });

  it('should handle messages with conversationId', async () => {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Follow-up message',
        conversationId: '550e8400-e29b-41d4-a716-446655440000',
      }),
    });

    expect(response.status).toBe(200);
  });

  it('should return error for empty message', async () => {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('INVALID_MESSAGE');
  });

  it('should return error for too long message', async () => {
    const longMessage = 'a'.repeat(100001);
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: longMessage }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('INVALID_MESSAGE');
  });

  it('should create new conversation if conversationId not provided', async () => {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'New conversation message' }),
    });

    expect(response.status).toBe(200);
  });
});
