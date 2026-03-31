# GLM Chat Application

A DeepSeek-like chat application built with React and Express, using GLM API for AI responses.

## Features

- **Streaming AI Responses**: Real-time streaming of AI responses using Server-Sent Events (SSE)
- **Conversation Management**: Create, rename, and delete conversations
- **Chat History**: View and resume previous conversations
- **Markdown Support**: Render AI responses with markdown formatting and syntax highlighting
- **Responsive Design**: Mobile-friendly interface
- **Accessibility**: ARIA labels, keyboard navigation support

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- TanStack React Query for state management
- Vite for build tooling
- React Markdown + Syntax Highlighter for message rendering
- Vitest + React Testing Library + Playwright for testing

### Backend
- Node.js with Express
- GLM API integration (via OpenAI SDK)
- lowdb v3 for file-based JSON database
- Vitest + MSW for testing

## Project Structure

```
deepseek-chat/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── middleware/      # Error handling, validation, rate limiting
│   │   │   └── routes/          # API endpoints
│   │   ├── models/              # Data models
│   │   ├── services/            # Business logic (database, GLM client)
│   │   ├── utils/               # Utilities (stream handler, title generator)
│   │   └── server.js            # Express server entry point
│   ├── data/                    # JSON database storage
│   └── tests/                   # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ChatInterface/   # Chat UI components
│   │   │   ├── ConversationList/# Conversation sidebar
│   │   │   └── shared/          # Shared components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   ├── services/            # API clients
│   │   └── types/               # TypeScript types
│   └── tests/                   # Frontend tests
└── specs/                       # Feature specifications
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- GLM API key from [BigModel](https://open.bigmodel.cn/)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd deepseek-chat
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:

**Backend (`.env`)**:
```env
GLM_API_KEY=your_glm_api_key_here
GLM_API_BASE=https://open.bigmodel.cn/api/paas/v4/
GLM_MODEL=glm-4
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**Frontend (`.env`)**:
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start the development servers:

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

5. Open your browser to `http://localhost:5173`

## API Documentation

### POST /api/chat

Send a message and receive a streaming AI response.

**Request:**
```json
{
  "message": "Hello, GLM!",
  "conversationId": "optional-conversation-uuid"
}
```

**Response:** Server-Sent Events (SSE) stream
```
data: {"content":"Hello"}
data: {"content":"!"}
data: [DONE]
```

### GET /api/conversations

List all conversations.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Conversation Title",
    "messageCount": 5,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastMessage": {
      "role": "assistant",
      "content": "Last message preview...",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
]
```

### POST /api/conversations

Create a new conversation.

**Request:**
```json
{
  "title": "New Chat"
}
```

### GET /api/conversations/:id

Get a conversation with all messages.

### PATCH /api/conversations/:id

Update conversation title.

**Request:**
```json
{
  "title": "Updated Title"
}
```

### DELETE /api/conversations/:id

Delete a conversation and all its messages.

### GET /api/conversations/:id/messages

Get messages for a conversation (paginated).

### GET /api/health

Health check endpoint.

## Testing

### Backend Tests
```bash
cd backend
npm test              # Run all tests
npm run test:coverage # Run with coverage
```

### Frontend Tests
```bash
cd frontend
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests
```

### Test Coverage

The project maintains 80%+ test coverage as per constitution requirements.

## Performance

- **Streaming**: Messages display in under 100ms
- **AI Response**: Response starts in under 2 seconds
- **Markdown Rendering**: Completes in under 500ms
- **Rate Limiting**: 20 requests per minute for chat endpoint

## Security

- **Input Sanitization**: HTML tags stripped from user input
- **Rate Limiting**: Prevents API abuse
- **XSS Protection**: React's built-in escaping + custom sanitization
- **API Key Protection**: Server-side only, never exposed to client

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift+Enter**: New line in message input
- **Escape**: Cancel edit mode

## Contributing

1. Follow the constitution in `.specify/memory/constitution.md`
2. Write tests before implementation (TDD)
3. Maintain 80%+ test coverage
4. Prioritize readability and simplicity

## License

MIT

## Acknowledgments

- GLM API by [BigModel](https://open.bigmodel.cn/)
- Inspired by [DeepSeek](https://www.deepseek.com/)
