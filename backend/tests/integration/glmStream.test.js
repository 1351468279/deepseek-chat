import { describe, it, expect, vi } from 'vitest';
import { streamChatCompletion } from '../../src/services/glmClient.js';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

describe('GLM Streaming Response Handling', () => {
  const server = setupServer(
    http.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', () => {
      return HttpResponse.json({
        id: 'test',
        choices: [{ message: { role: 'assistant', content: 'Test response' } }],
      });
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should accumulate streaming chunks', async () => {
    const chunks = [];
    const onChunk = vi.fn((chunk) => chunks.push(chunk.content));

    const fullContent = await streamChatCompletion(
      [{ role: 'user', content: 'Test' }],
      onChunk
    );

    expect(chunks.length).toBeGreaterThan(0);
    expect(fullContent).toBeTruthy();
  });

  it('should handle streaming errors gracefully', async () => {
    server.use(
      http.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', () => {
        return HttpResponse.error(new Error('Network error'));
      })
    );

    await expect(
      streamChatCompletion([{ role: 'user', content: 'Test' }])
    ).rejects.toThrow();
  });

  it('should call onChunk callback for each content delta', async () => {
    const onChunk = vi.fn();

    await streamChatCompletion([{ role: 'user', content: 'Test' }], onChunk);

    expect(onChunk).toHaveBeenCalled();
  });
});
