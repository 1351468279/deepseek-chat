# GLM API Integration Contract

**Feature**: 001-glm-chat-app
**Version**: 1.0.0
**Date**: 2026-03-30

## Overview

This document defines the contract between the application and the GLM (智谱清言) API for AI chat completions.

---

## API Configuration

### Base URL

```
https://open.bigmodel.cn/api/paas/v4/
```

### Authentication

- **Method**: Bearer Token (API Key)
- **Header**: `Authorization: Bearer <API_KEY>`
- **API Key Format**: `id.secret`

### Environment Variables

```bash
GLM_API_KEY=your_api_key_here
GLM_API_BASE=https://open.bigmodel.cn/api/paas/v4/
GLM_MODEL=glm-4
```

---

## Chat Completions Endpoint

### Non-Streaming

**Endpoint**: `POST /chat/completions`

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <API_KEY>
```

**Request Body**:
```json
{
  "model": "glm-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 0.9
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `model` | string | Yes | - | Model identifier (e.g., `glm-4`, `glm-4-flash`) |
| `messages` | array | Yes | - | Conversation history |
| `temperature` | number | No | 0.7 | Sampling temperature (0-1) |
| `max_tokens` | number | No | - | Maximum tokens in response |
| `top_p` | number | No | 0.9 | Nucleus sampling threshold |

**Message Format**:
```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

**Response** (200 OK):
```json
{
  "id": "chatcmpl-123456789",
  "object": "chat.completion",
  "created": 1680307200,
  "model": "glm-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I'm doing well, thank you for asking!"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

---

### Streaming

**Endpoint**: `POST /chat/completions`

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <API_KEY>
```

**Request Body**: Same as non-streaming, with additional field:
```json
{
  "model": "glm-4",
  "messages": [...],
  "stream": true
}
```

**Response**: Server-Sent Events (SSE) stream

`Content-Type: text/event-stream`

**Stream Format**:
```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1680307200,"model":"glm-4","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1680307200,"model":"glm-4","choices":[{"index":0,"delta":{"content":"I"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1680307200,"model":"glm-4","choices":[{"index":0,"delta":{"content":"'m"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1680307200,"model":"glm-4","choices":[{"index":0,"delta":{"content":" doing"},"finish_reason":null}]}

...

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1680307200,"model":"glm-4","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

**Chunk Format**:
```typescript
interface StreamChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}
```

**Parsing Logic**:
1. Read lines prefixed with `data: `
2. Parse JSON from each line
3. Extract `choices[0].delta.content`
4. Accumulate content to build full response
5. Stop when `finish_reason` is not null or receiving `[DONE]`

---

## Application Integration

### Client Configuration

```typescript
// backend/src/services/glmClient.ts
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: process.env.GLM_API_BASE || 'https://open.bigmodel.cn/api/paas/v4/',
  apiKey: process.env.GLM_API_KEY,
});

export default client;
```

### Streaming Handler

```typescript
// backend/src/api/routes/chat.ts
import glmClient from '../../services/glmClient.js';

export async function streamChat(req, res) {
  const { message, conversationId } = req.body;

  // Build conversation history
  const messages = await buildConversationHistory(conversationId, message);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await glmClient.chat.completions.create({
      model: process.env.GLM_MODEL || 'glm-4',
      messages,
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }

      if (chunk.choices[0]?.finish_reason) {
        break;
      }
    }

    // Save assistant message to database
    await saveAssistantMessage(conversationId, fullContent);

    res.write('data: [DONE]\n\n');
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    res.end();
  }
}
```

---

## Models

### Available Models

| Model | Description | Context Length | Recommended For |
|-------|-------------|----------------|-----------------|
| `glm-4` | General purpose, high quality | 128k tokens | Most use cases |
| `glm-4-flash` | Faster, lower cost | 128k tokens | High-volume requests |
| `glm-4-air` | Lightweight | 128k tokens | Simple tasks |

**Application Default**: `glm-4`

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "message": "Error description",
    "type": "error_type",
    "param": null,
    "code": "error_code"
  }
}
```

### Common Errors

| HTTP Code | Error Type | Description | Retry Strategy |
|-----------|------------|-------------|----------------|
| 401 | `invalid_authentication` | Invalid API key | Do not retry |
| 429 | `rate_limit_exceeded` | Rate limit reached | Retry with exponential backoff |
| 500 | `server_error` | GLM API internal error | Retry with exponential backoff |
| 503 | `service_unavailable` | GLM API temporarily unavailable | Retry with exponential backoff |

### Retry Configuration

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,  // ms
  maxDelay: 10000,     // ms
  backoffMultiplier: 2,
};
```

### Retry Logic

```typescript
async function callGLMWithRetry(messages, options = {}) {
  const { maxRetries = 3, initialDelay = 1000 } = options;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await glmClient.chat.completions.create({
        model: 'glm-4',
        messages,
        ...options,
      });
    } catch (error) {
      const isRetryable = [429, 500, 503].includes(error.status);
      const isLastAttempt = attempt === maxRetries;

      if (!isRetryable || isLastAttempt) {
        throw error;
      }

      await sleep(delay);
      delay = Math.min(delay * 2, 10000); // Exponential backoff, max 10s
    }
  }
}
```

---

## Rate Limits

### API Quotas

| Plan | Requests per Minute | Tokens per Day |
|------|---------------------|----------------|
| Free | 4 | 200,000 |
| Coding (user's plan) | Refer to GLM documentation | Refer to GLM documentation |

**Note**: Exact limits depend on the user's GLM coding plan subscription.

### Application-Level Rate Limiting

To prevent exhausting API quota:

```typescript
// Rate limiter configuration
const rateLimiter = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 20,       // Conservative limit
};

// Per-user rate limiting recommended for multi-user deployments
```

---

## Token Estimation

For saving message metadata and planning purposes:

```typescript
function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for English
  // ~2 characters per token for Chinese
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;

  return Math.ceil(chineseChars / 2 + otherChars / 4);
}
```

---

## Security Considerations

1. **API Key Protection**:
   - Never include API key in frontend code
   - Store in environment variables
   - Use `.env` files (gitignored)
   - Rotate keys if compromised

2. **Input Sanitization**:
   - Validate message length before sending to API
   - Strip or escape potentially harmful content
   - Limit conversation history length

3. **Cost Control**:
   - Monitor token usage
   - Set `max_tokens` on requests
   - Implement application-level rate limits

---

## Testing with Mock GLM API

For development and testing, use MSW to mock GLM responses:

```typescript
// tests/mocks/glmApi.ts
import { http, HttpResponse } from 'msw';

export const glmHandlers = [
  http.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', async ({ request }) => {
    const body = await request.json();

    if (body.stream) {
      // Return streaming mock
      return new HttpResponse(
        new ReadableStream({
          start(controller) {
            const mockResponse = 'This is a mock AI response for testing.';
            let i = 0;

            const interval = setInterval(() => {
              if (i < mockResponse.length) {
                const chunk = {
                  choices: [{ delta: { content: mockResponse[i] } }]
                };
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
                );
                i++;
              } else {
                clearInterval(interval);
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

    // Return non-streaming mock
    return HttpResponse.json({
      id: 'mock-' + Date.now(),
      choices: [{
        message: {
          role: 'assistant',
          content: 'This is a mock AI response for testing.'
        }
      }]
    });
  }),
];
```

---

## Monitoring

### Metrics to Track

1. **Request Count**: Total API requests made
2. **Token Usage**: Prompt + completion tokens
3. **Latency**: Time to first token and total response time
4. **Error Rate**: Failed requests vs. total
5. **Stream Duration**: Time from request to completion

### Health Check

```typescript
async function checkGLMHealth(): Promise<boolean> {
  try {
    const response = await glmClient.chat.completions.create({
      model: 'glm-4',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 5,
    });
    return true;
  } catch {
    return false;
  }
}
```

---

**Contract Version**: 1.0.0
**GLM API Documentation**: https://open.bigmodel.cn/dev/api
**Last Updated**: 2026-03-30
