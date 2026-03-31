# API Endpoints Contract

**Feature**: 001-glm-chat-app
**Version**: 1.0.0
**Date**: 2026-03-30

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Content Type

All requests use `Content-Type: application/json`

All responses use `Content-Type: application/json` except where noted (streaming endpoints use `text/event-stream`)

---

## Endpoints

### 1. List Conversations

Get all conversations ordered by most recently updated.

**Endpoint**: `GET /conversations`

**Query Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `limit` | number | No | 50 | Maximum number of conversations to return |
| `offset` | number | No | 0 | Number of conversations to skip |

**Request**:
```http
GET /api/conversations?limit=20&offset=0
```

**Response** (200 OK):
```json
{
  "conversations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Help with React hooks",
      "createdAt": "2026-03-30T10:00:00.000Z",
      "updatedAt": "2026-03-30T10:15:30.500Z",
      "messageCount": 12,
      "lastMessage": {
        "role": "assistant",
        "content": "Let me know if you need more help!",
        "timestamp": "2026-03-30T10:15:30.500Z"
      }
    }
  ],
  "total": 45
}
```

**Error Responses**:
- `500 Internal Server Error`: Database error

---

### 2. Get Conversation

Get a single conversation with all its messages.

**Endpoint**: `GET /conversations/:id`

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string (UUID) | Yes | Conversation ID |

**Request**:
```http
GET /api/conversations/550e8400-e29b-41d4-a716-446655440000
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Help with React hooks",
  "createdAt": "2026-03-30T10:00:00.000Z",
  "updatedAt": "2026-03-30T10:15:30.500Z",
  "messageCount": 12,
  "messages": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "role": "user",
      "content": "How do I use useEffect in React?",
      "timestamp": "2026-03-30T10:00:05.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "role": "assistant",
      "content": "useEffect is a React Hook...",
      "timestamp": "2026-03-30T10:00:06.500Z"
    }
  ]
}
```

**Error Responses**:
- `404 Not Found`: Conversation not found
```json
{
  "error": "Conversation not found",
  "code": "CONVERSATION_NOT_FOUND"
}
```
- `400 Bad Request`: Invalid UUID format
```json
{
  "error": "Invalid conversation ID format",
  "code": "INVALID_ID"
}
```

---

### 3. Create Conversation

Create a new conversation.

**Endpoint**: `POST /conversations`

**Request Body**:
```json
{
  "title": "Optional custom title"
}
```

| Field | Type | Required | Description |
|-------|----------|----------|-------------|
| `title` | string | No | Custom title (1-100 chars). If omitted, auto-generated from first message. |

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "New Chat",
  "createdAt": "2026-03-30T10:00:00.000Z",
  "updatedAt": "2026-03-30T10:00:00.000Z",
  "messageCount": 0
}
```

**Error Responses**:
- `400 Bad Request`: Invalid title length
```json
{
  "error": "Title must be between 1 and 100 characters",
  "code": "INVALID_TITLE"
}
```

---

### 4. Update Conversation

Update conversation title.

**Endpoint**: `PATCH /conversations/:id`

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string (UUID) | Yes | Conversation ID |

**Request Body**:
```json
{
  "title": "Updated title"
}
```

| Field | Type | Required | Description |
|-------|----------|----------|-------------|
| `title` | string | Yes | New title (1-100 chars) |

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated title",
  "createdAt": "2026-03-30T10:00:00.000Z",
  "updatedAt": "2026-03-30T10:20:00.000Z",
  "messageCount": 12
}
```

**Error Responses**:
- `404 Not Found`: Conversation not found
- `400 Bad Request`: Invalid title or ID format

---

### 5. Delete Conversation

Delete a conversation and all its messages.

**Endpoint**: `DELETE /conversations/:id`

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string (UUID) | Yes | Conversation ID |

**Request**:
```http
DELETE /api/conversations/550e8400-e29b-41d4-a716-446655440000
```

**Response** (204 No Content): Empty body

**Error Responses**:
- `404 Not Found`: Conversation not found
- `400 Bad Request`: Invalid UUID format

---

### 6. Send Chat Message (Streaming)

Send a message and receive a streaming AI response.

**Endpoint**: `POST /chat`

**Request Body**:
```json
{
  "message": "How do I use useEffect?",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field | Type | Required | Description |
|-------|----------|----------|-------------|
| `message` | string | Yes | User message content (1-100000 chars) |
| `conversationId` | string (UUID) | No | Existing conversation ID. If omitted, creates new conversation. |

**Response**: Server-Sent Events (SSE) stream

`Content-Type: text/event-stream`
`Cache-Control: no-cache`
`Connection: keep-alive`

**Stream Format**:
```
data: {"content":"H"}
data: {"content":"e"}
data: {"content":"l"}
data: {"content":"l"}
data: {"content":"o"}
data: {"content":","}
data: {"content":" "}
...
data: [DONE]
```

**Event Types**:

| Event | Description |
|-------|-------------|
| `data: {"content":"..."}` | Chunk of AI response content |
| `data: {"error":"..."}` | Error occurred during streaming |
| `data: [DONE]` | Stream complete (final event) |

**Error Responses** (immediate, not streamed):
- `400 Bad Request`: Message too long or empty
```json
{
  "error": "Message must be between 1 and 100000 characters",
  "code": "INVALID_MESSAGE"
}
```
- `429 Too Many Requests`: Rate limit exceeded
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "code": "RATE_LIMITED",
  "retryAfter": 60
}
```
- `502 Bad Gateway`: GLM API error
```json
{
  "error": "AI service temporarily unavailable",
  "code": "AI_SERVICE_ERROR"
}
```

---

### 7. Get Messages

Get messages for a conversation (paginated).

**Endpoint**: `GET /conversations/:id/messages`

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string (UUID) | Yes | Conversation ID |

**Query Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `limit` | number | No | 50 | Maximum messages to return |
| `offset` | number | No | 0 | Number of messages to skip |
| `before` | string (ISO date) | No | - | Only messages before this timestamp |

**Request**:
```http
GET /api/conversations/550e8400-e29b-41d4-a716-446655440000/messages?limit=50&offset=0
```

**Response** (200 OK):
```json
{
  "messages": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "role": "user",
      "content": "How do I use useEffect?",
      "timestamp": "2026-03-30T10:00:05.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "role": "assistant",
      "content": "useEffect is a React Hook...",
      "timestamp": "2026-03-30T10:00:06.500Z"
    }
  ],
  "total": 12,
  "hasMore": false
}
```

**Error Responses**:
- `404 Not Found`: Conversation not found
- `400 Bad Request`: Invalid UUID format

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}  // Optional: additional error details
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_ID` | 400 | UUID format validation failed |
| `INVALID_TITLE` | 400 | Title length validation failed |
| `INVALID_MESSAGE` | 400 | Message content validation failed |
| `CONVERSATION_NOT_FOUND` | 404 | Conversation does not exist |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_SERVICE_ERROR` | 502 | GLM API unavailable |
| `DATABASE_ERROR` | 500 | File database operation failed |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /chat` | 20 requests | 1 minute |
| All other endpoints | 100 requests | 1 minute |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1680307200
```

---

## CORS Headers

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Health Check

**Endpoint**: `GET /health`

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2026-03-30T10:00:00.000Z",
  "database": "connected",
  "glmApi": "connected"
}
```

---

**Contract Version**: 1.0.0
**Last Updated**: 2026-03-30
