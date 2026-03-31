import { http, HttpResponse } from 'msw';

/**
 * MSW handlers for mocking backend API in frontend tests
 */

export const apiHandlers = [
  // Mock health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      glmApi: 'connected',
    });
  }),

  // Mock conversations list
  http.get('/api/conversations', () => {
    return HttpResponse.json({
      conversations: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 2,
          lastMessage: {
            role: 'assistant',
            content: 'Test response',
            timestamp: new Date().toISOString(),
          },
        },
      ],
      total: 1,
    });
  }),

  // Mock get conversation
  http.get('/api/conversations/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Test Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 2,
      messages: [
        {
          id: '660e8400-e29b-41d4-a716-446655440001',
          role: 'user',
          content: 'Test message',
          timestamp: new Date().toISOString(),
        },
        {
          id: '660e8400-e29b-41d4-a716-446655440002',
          role: 'assistant',
          content: 'Test response',
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }),

  // Mock create conversation
  http.post('/api/conversations', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'mock-conversation-id',
      title: body.title || 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    });
  }),

  // Mock chat streaming
  http.post('/api/chat', async ({ request }) => {
    const body = await request.json();

    return new HttpResponse(
      new ReadableStream({
        start(controller) {
          const mockResponse = 'This is a mock streaming response.';
          let i = 0;

          const interval = setInterval(() => {
            if (i < mockResponse.length) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content: mockResponse[i] })}\n\n`)
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
  }),

  // Mock update conversation
  http.patch('/api/conversations/:id', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'mock-conversation-id',
      title: body.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    });
  }),

  // Mock delete conversation
  http.delete('/api/conversations/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Mock get messages
  http.get('/api/conversations/:id/messages', () => {
    return HttpResponse.json({
      messages: [
        {
          id: '660e8400-e29b-41d4-a716-446655440001',
          role: 'user',
          content: 'Test message',
          timestamp: new Date().toISOString(),
        },
      ],
      total: 1,
      hasMore: false,
    });
  }),

  // Mock error responses
  http.get('/api/conversations/error-test', () => {
    return HttpResponse.json(
      { error: 'Test error', code: 'TEST_ERROR' },
      { status: 500 }
    );
  }),
];
