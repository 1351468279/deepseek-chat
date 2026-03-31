# Research: GLM Chat Application

**Feature**: 001-glm-chat-app
**Date**: 2026-03-30
**Status**: Complete

## Overview

This document captures research findings for technology choices, best practices, and integration patterns for the GLM Chat Application.

---

## GLM API Integration

### Decision: OpenAI-Compatible SDK with Streaming Support

**Rationale**: GLM API follows OpenAI-compatible format for chat completions. Using an OpenAI-compatible client library allows easy integration with fallback options for testing.

**Alternatives Considered**:
- Direct fetch API calls: More control but requires manual streaming implementation
- OpenAI SDK: Excellent but designed specifically for OpenAI endpoints
- Custom axios wrapper: Good middle ground but more maintenance

**Selected Approach**: Use `openai` npm package configured for GLM API endpoint. This provides:
- Built-in streaming support with Server-Sent Events (SSE)
- Type definitions for request/response models
- Automatic retry logic
- Error handling patterns

**Configuration**:
```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',  // GLM endpoint
  apiKey: process.env.GLM_API_KEY,
});

// Streaming example
const stream = await client.chat.completions.create({
  model: 'glm-4',
  messages: conversationHistory,
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  // Emit to frontend
}
```

---

## File-Based Database Selection

### Decision: lowdb v3 (Native ESM)

**Rationale**: lowdb provides a simple JSON file database with native TypeScript support, perfect for single-user applications.

**Alternatives Considered**:
- neDB: Older, less maintained, callback-based API
- sqlite3: Overkill for JSON document storage
- fs JSON directly: No query capabilities, race conditions

**Selected Approach**: lowdb v3 with native ESM support

**Features**:
- In-memory operations with atomic file writes
- JSON database format (human-readable)
- Query API similar to MongoDB
- TypeScript-first design
- Tiny footprint (~5kB)

**Schema Design**:
```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "Auto-generated or user-set",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp",
      "messageCount": 0
    }
  ],
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "role": "user|assistant|system",
      "content": "message text",
      "timestamp": "ISO timestamp",
      "tokens": 0
    }
  ]
}
```

---

## React State Management for Chat

### Decision: React Query (TanStack Query) + useState

**Rationale**: Chat requires real-time updates and optimistic UI. React Query handles server state while useState handles UI state.

**Alternatives Considered**:
- Redux: Overkill for single-user app
- Zustand: Good but adds dependency for simple use case
- Context only: Difficult with streaming updates

**Selected Approach**:
- `useState` for local UI state (input value, loading state)
- `React Query` for server state (conversations list, message history)
- `useReducer` for complex chat state (messages array, streaming status)

**Streaming Pattern**:
```javascript
const useChatStreaming = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (content) => {
    // Optimistic update
    setMessages(prev => [...prev, { role: 'user', content }]);

    // Stream response
    setIsStreaming(true);
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: content, conversationId }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
        }
        return [...prev, { role: 'assistant', content: chunk }];
      });
    }

    setIsStreaming(false);
  };

  return { messages, isStreaming, sendMessage };
};
```

---

## Markdown and Code Highlighting

### Decision: react-markdown + react-syntax-highlighter

**Rationale**: Battle-tested libraries with strong security (XSS protection) and extensibility.

**Alternatives Considered**:
- marked: Faster but requires manual XSS protection
- remark-react: Lower-level, more setup required
- Custom parser: Reinventing the wheel

**Selected Approach**:
```javascript
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

<ReactMarkdown
  components={{
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  }}
>
  {content}
</ReactMarkdown>
```

**Security**: react-markdown escapes HTML by default, preventing XSS attacks from AI responses.

---

## Server-Sent Events (SSE) Implementation

### Decision: Express + text/event-stream

**Rationale**: Native browser support via EventSource API, simpler than WebSocket for one-way streaming.

**Alternatives Considered**:
- WebSocket: Bidirectional, but overkill for AI responses
- Polling: Poor UX, high server load
- Chunked transfer: Less standard, harder to handle

**Selected Approach** (Express):
```javascript
app.post('/api/chat', async (req, res) => {
  const { message, conversationId } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await glmClient.chat.completions.create({
      model: 'glm-4',
      messages: await getConversationHistory(conversationId),
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save complete response
    await saveMessage(conversationId, 'assistant', fullContent);

    res.write('data: [DONE]\n\n');
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    res.end();
  }
});
```

---

## Auto-Title Generation Strategy

### Decision: First Message Summary (Client-Side)

**Rationale**: Simple, no additional API cost, works offline.

**Alternatives Considered**:
- GLM API to generate titles: Accurate but adds cost/latency
- First N characters: Simple but often cuts off mid-word
- User-set only: No default, poor UX

**Selected Approach**:
```javascript
const generateTitle = (firstMessage) => {
  // Take first 30-50 characters, end at word boundary
  const maxLength = 40;
  if (firstMessage.length <= maxLength) return firstMessage;

  const truncated = firstMessage.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
};
```

---

## Testing Strategy

### Unit Tests: Vitest

**Rationale**: Fast, native ESM support, compatible with Vite.

### Component Tests: React Testing Library

**Rationale**: Tests user behavior, not implementation details.

### E2E Tests: Playwright

**Rationale**: Cross-browser, fast, good TypeScript support.

### Mocking: MSW (Mock Service Worker)

**Rationale**: API mocking at network level, works for unit and E2E tests.

**Example GLM Mock**:
```javascript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', async ({ request }) => {
    return new HttpResponse(
      new ReadableStream({
        start(controller) {
          const mockResponse = 'This is a mock AI response.';
          let i = 0;
          const interval = setInterval(() => {
            if (i < mockResponse.length) {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    choices: [{ delta: { content: mockResponse[i] } }]}
                  )}\n\n`
                )
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
  }),
];
```

---

## Project Structure Best Practices

### Monorepo vs Separate Repos

**Decision**: Monorepo with root-level workspace (npm workspaces or pnpm)

**Rationale**: Simpler for small team, shared types, single deployment pipeline.

### Shared Types

**Decision**: `packages/types` package with TypeScript interfaces

```typescript
// packages/types/src/index.ts
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatStreamEvent {
  content?: string;
  error?: string;
  done?: boolean;
}
```

---

## Environment Configuration

### Required Variables

```bash
# .env.example
GLM_API_KEY=your_api_key_here
GLM_API_BASE=https://open.bigmodel.cn/api/paas/v4/
GLM_MODEL=glm-4
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001
```

---

## Performance Considerations

### Message Pagination

**Decision**: Load last 50 messages initially, implement infinite scroll

**Rationale**: Prevents loading 1000+ messages at once.

### Conversation List Caching

**Decision**: Cache in memory with React Query (5-minute stale time)

**Rationale**: Frequent access, low change frequency.

### Markdown Rendering Optimization

**Decision**: Memoize rendered markdown, use virtual list for long chats

```javascript
const MemoizedMarkdown = React.memo(({ content }) => (
  <ReactMarkdown>{content}</ReactMarkdown>
));
```

---

## Security Considerations

1. **API Key Protection**: Never expose GLM API key to frontend. Proxy through backend.
2. **XSS Prevention**: Use react-markdown's default escaping.
3. **Rate Limiting**: Implement per-IP rate limits on chat endpoint.
4. **Input Validation**: Sanitize all user inputs, limit message length.
5. **File Access**: Restrict database file access to backend process only.

---

## Deployment Recommendations

### Development
- Frontend: Vite dev server on port 5173
- Backend: Express on port 3001
- Proxy: Vite proxy to backend

### Production
- Build: Static frontend files served by Express or nginx
- Process Manager: PM2 or systemd
- Database: JSON files in `/var/lib/glm-chat/data`
- Environment: Production variables in `.env` file

---

## Research Summary

| Area | Decision | Key Benefit |
|------|----------|-------------|
| GLM API | OpenAI SDK with custom baseURL | Streaming, retry, error handling |
| Database | lowdb v3 | Simple JSON storage, TypeScript support |
| State Management | React Query + useState | Optimistic UI, caching |
| Markdown | react-markdown + syntax-highlighter | XSS protection, code highlighting |
| Streaming | SSE (text/event-stream) | Native browser support |
| Testing | Vitest + RTL + Playwright + MSW | Full coverage, API mocking |
| Deployment | Express serves static build | Single server deployment |

---

**Status**: All research complete. Ready for Phase 1: Design & Contracts.
