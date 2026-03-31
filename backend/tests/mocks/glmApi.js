import { http, HttpResponse } from 'msw';

/**
 * MSW handlers for mocking GLM API in tests
 */

// Mock streaming response generator
function createMockStream(responseText) {
  return new HttpResponse(
    new ReadableStream({
      start(controller) {
        let i = 0;
        const interval = setInterval(() => {
          if (i < responseText.length) {
            const chunk = {
              choices: [{ delta: { content: responseText[i] } }],
            };
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
            );
            i++;
          } else {
            clearInterval(interval);
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            controller.close();
          }
        }, 20);
      },
    }),
    {
      headers: { 'Content-Type': 'text/event-stream' },
    }
  );
}

export const glmHandlers = [
  // Mock streaming chat completion
  http.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', async ({ request }) => {
    const body = await request.json();

    if (body.stream) {
      // Return streaming mock
      const mockResponse = 'This is a mock AI response for testing streaming functionality.';
      return createMockStream(mockResponse);
    }

    // Return non-streaming mock
    return HttpResponse.json({
      id: 'mock-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'glm-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a mock AI response for testing.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 10,
        total_tokens: 20,
      },
    });
  }),

  // Mock health check
  http.get('https://open.bigmodel.cn/api/paas/v4/models', () => {
    return HttpResponse.json({
      object: 'list',
      data: [
        {
          id: 'glm-4',
          object: 'model',
          created: 1677610602,
          owned_by: 'zhipu',
        },
      ],
    });
  }),
];
