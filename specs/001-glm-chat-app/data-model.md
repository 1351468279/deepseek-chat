# Data Model: GLM Chat Application

**Feature**: 001-glm-chat-app
**Date**: 2026-03-30
**Status**: Complete

## Overview

This document defines the data entities, their relationships, validation rules, and storage format for the GLM Chat Application.

---

## Entities

### Conversation

Represents a single chat session containing multiple messages.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | string (UUID) | Unique conversation identifier | Required, format: uuid |
| `title` | string | Display name for the conversation | Required, 1-100 characters |
| `createdAt` | string (ISO 8601) | Creation timestamp | Required, format: YYYY-MM-DDTHH:mm:ss.sssZ |
| `updatedAt` | string (ISO 8601) | Last update timestamp | Required, format: YYYY-MM-DDTHH:mm:ss.sssZ |
| `messageCount` | number | Number of messages in conversation | Required, >= 0 |

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Help with React hooks",
  "createdAt": "2026-03-30T10:00:00.000Z",
  "updatedAt": "2026-03-30T10:15:30.500Z",
  "messageCount": 12
}
```

**Validation Rules**:
- `id` must be a valid UUID v4
- `title` must not be empty or whitespace only
- `title` length: 1-100 characters
- `messageCount` must be non-negative integer
- `updatedAt` must be >= `createdAt`

---

### Message

Represents a single message within a conversation.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | string (UUID) | Unique message identifier | Required, format: uuid |
| `conversationId` | string (UUID) | Reference to parent conversation | Required, must exist in conversations |
| `role` | enum | Message sender type | Required, one of: `user`, `assistant`, `system` |
| `content` | string | Message text content | Required, 1-100000 characters |
| `timestamp` | string (ISO 8601) | Message creation time | Required, format: YYYY-MM-DDTHH:mm:ss.sssZ |
| `tokens` | number | Approximate token count (optional) | Optional, >= 0 |

**Example**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "user",
  "content": "How do I use useEffect in React?",
  "timestamp": "2026-03-30T10:00:05.000Z",
  "tokens": 12
}
```

**Validation Rules**:
- `id` must be a valid UUID v4
- `conversationId` must reference an existing conversation
- `role` must be one of: `user`, `assistant`, `system`
- `content` must not be empty or whitespace only
- `content` length: 1-100,000 characters
- `tokens` must be non-negative integer if present
- `timestamp` must be >= parent conversation's `createdAt`

---

## Relationships

```
┌─────────────────┐
│  Conversation   │
├─────────────────┤
│ id (PK)         │───┐
│ title           │   │
│ createdAt       │   │ 1:N
│ updatedAt       │   │
│ messageCount    │───┤
└─────────────────┘   │
                      │
                      │ ┌─────────────────┐
                      └─│     Message     │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ conversationId  │ (FK)
                        │ role            │
                        │ content         │
                        │ timestamp       │
                        │ tokens          │
                        └─────────────────┘
```

**Relationship Rules**:
- One conversation contains many messages (1:N)
- A message must belong to exactly one conversation
- Messages are ordered by `timestamp` within a conversation
- Deleting a conversation cascades to delete all its messages

---

## State Transitions

### Conversation Lifecycle

```
┌──────────┐  create  ┌──────────────┐
│          ├──────────>│              │
│   None   │           │  Active      │
│          │<──────────┤              │
└──────────┘   delete  └──────────────┘
                           │
                           │ rename
                           │
                           ▼
                     ┌──────────────┐
                     │              │
                     │  Active      │
                     │ (renamed)    │
                     └──────────────┘
```

**States**:
- **None**: Conversation does not exist
- **Active**: Conversation exists and can receive messages

**Transitions**:
- `create`: Creates a new conversation with empty title, messageCount = 0
- `delete`: Removes conversation and all associated messages
- `rename`: Updates conversation title

### Message Lifecycle

```
┌──────────┐  send    ┌──────────────┐
│          ├──────────>│              │
│   None   │           │  Pending     │
│          │           │              │
└──────────┘           └──────┬───────┘
                              │
                              │ stream
                              ▼
                        ┌──────────────┐
                        │              │
                        │  Streaming   │
                        │              │
                        └──────┬───────┘
                               │
                               │ complete
                               ▼
                         ┌──────────────┐
                         │              │
                         │  Completed   │
                         │              │
                         └──────────────┘
```

**States**:
- **None**: Message does not exist
- **Pending**: User message created, waiting for AI response
- **Streaming**: AI response is being streamed character by character
- **Completed**: Full message content received and stored

**Transitions**:
- `send`: Creates user message, transitions to Pending
- `stream`: Begins streaming assistant response
- `complete`: Finalizes streaming, saves complete message to storage

---

## Storage Format

### File Structure

```
backend/data/
├── conversations.json
├── messages.json
└── .gitkeep
```

### conversations.json

```json
{
  "conversations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Help with React hooks",
      "createdAt": "2026-03-30T10:00:00.000Z",
      "updatedAt": "2026-03-30T10:15:30.500Z",
      "messageCount": 12
    }
  ]
}
```

### messages.json

```json
{
  "messages": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "conversationId": "550e8400-e29b-41d4-a716-446655440000",
      "role": "user",
      "content": "How do I use useEffect in React?",
      "timestamp": "2026-03-30T10:00:05.000Z",
      "tokens": 12
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "conversationId": "550e8400-e29b-41d4-a716-446655440000",
      "role": "assistant",
      "content": "useEffect is a React Hook that lets you perform side effects...",
      "timestamp": "2026-03-30T10:00:06.500Z",
      "tokens": 45
    }
  ]
}
```

---

## Indexes

For efficient querying, the following in-memory indexes should be maintained:

| Index | Key | Purpose |
|-------|-----|---------|
| `conversationsByUpdatedAt` | `updatedAt` DESC | List conversations sorted by recent activity |
| `messagesByConversation` | `conversationId`, `timestamp` ASC | Retrieve messages for a conversation in order |
| `messagesByTimestamp` | `timestamp` DESC | Find recent messages across all conversations |

---

## Data Access Patterns

### Create Conversation

```javascript
const conversation = {
  id: uuidv4(),
  title: generateTitle(firstMessage) || "New Chat",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messageCount: 0
};
db.data.conversations.push(conversation);
await db.write();
```

### Add Message

```javascript
const message = {
  id: uuidv4(),
  conversationId,
  role: 'user',
  content,
  timestamp: new Date().toISOString(),
  tokens: estimateTokens(content)
};
db.data.messages.push(message);

// Update conversation
const conversation = db.data.conversations.find(c => c.id === conversationId);
conversation.messageCount++;
conversation.updatedAt = new Date().toISOString();

await db.write();
```

### Get Conversation with Messages

```javascript
const conversation = db.data.conversations.find(c => c.id === conversationId);
const messages = db.data.messages
  .filter(m => m.conversationId === conversationId)
  .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

return { ...conversation, messages };
```

### List Conversations

```javascript
const conversations = db.data.conversations
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .map(c => ({
    ...c,
    lastMessage: db.data.messages
      .filter(m => m.conversationId === c.id)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]
  }));
```

---

## Validation Summary

| Entity | Required Fields | Unique Fields | Foreign Keys |
|--------|----------------|---------------|--------------|
| Conversation | id, title, createdAt, updatedAt, messageCount | id | - |
| Message | id, conversationId, role, content, timestamp | id | conversationId → Conversation.id |

---

## Migration Notes

### v1 (Initial)

- Create `conversations.json` with empty array
- Create `messages.json` with empty array
- No migration path needed (fresh installation)

### Future Migrations

To add fields in future versions:
1. Read existing data
2. Apply default values for new fields
3. Write back to file

Example migration for adding `pinned` field to conversations:
```javascript
// Add pinned: false to all existing conversations
db.data.conversations.forEach(c => {
  c.pinned = c.pinned ?? false;
});
```

---

**Status**: Data model complete. Ready for implementation.
