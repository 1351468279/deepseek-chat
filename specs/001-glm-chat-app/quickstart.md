# Quickstart Guide: GLM Chat Application

**Feature**: 001-glm-chat-app
**Branch**: `001-glm-chat-app`
**Last Updated**: 2026-03-30

## Overview

This guide helps developers get started with the GLM Chat Application - a DeepSeek-like chat interface using GLM API, React frontend, and Express backend.

---

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ or **pnpm**: v8+
- **GLM API Key**: Sign up at https://open.bigmodel.cn/
- **Git**: For version control

---

## Project Structure

```
deepseek-chat/
├── backend/              # Express API server
│   ├── src/
│   ├── data/             # JSON database files
│   └── tests/
├── frontend/             # React application
│   ├── src/
│   └── tests/
├── specs/                # Feature specifications
└── .specify/             # SpecKit configuration
```

---

## Initial Setup

### 1. Clone and Navigate

```bash
cd deepseek-chat
git checkout 001-glm-chat-app
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 3. Configure Environment

Create `.env` files:

**Backend** (`backend/.env`):
```bash
GLM_API_KEY=your_api_key_here
GLM_API_BASE=https://open.bigmodel.cn/api/paas/v4/
GLM_MODEL=glm-4
PORT=3001
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_URL=http://localhost:3001/api
```

### 4. Initialize Database

```bash
cd backend
mkdir -p data
echo '{"conversations":[],"messages":[]}' > data/conversations.json
echo '{}' > data/messages.json
```

---

## Development

### Start Backend

```bash
cd backend
npm run dev
# Server running at http://localhost:3001
```

### Start Frontend

```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

### Access Application

Open http://localhost:5173 in your browser.

---

## Testing

### Run Unit Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Run Component Tests

```bash
cd frontend
npm run test:component
```

### Run E2E Tests

```bash
cd frontend
npm run test:e2e
```

### Test Coverage

```bash
# Backend
cd backend
npm run test:coverage

# Frontend
cd frontend
npm run test:coverage
```

---

## API Endpoints

### Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List all conversations |
| GET | `/api/conversations/:id` | Get conversation with messages |
| POST | `/api/conversations` | Create new conversation |
| PATCH | `/api/conversations/:id` | Update conversation title |
| DELETE | `/api/conversations/:id` | Delete conversation |
| POST | `/api/chat` | Send message (streaming) |
| GET | `/api/health` | Health check |

### Example: Send Message

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, GLM!"}'
```

---

## Common Tasks

### Add a New Frontend Component

```bash
cd frontend/src/components
mkdir MyComponent
touch MyComponent/MyComponent.tsx MyComponent/MyComponent.test.tsx
```

Component template:
```tsx
export interface MyComponentProps {
  // props here
}

export function MyComponent({ props }: MyComponentProps) {
  return (
    <div>
      {/* JSX here */}
    </div>
  );
}
```

### Add a New Backend Route

1. Create route file in `backend/src/api/routes/`
2. Register in `backend/src/server.ts`
3. Add tests in `backend/tests/integration/`

Route template:
```typescript
import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  // handler logic
  res.json({ data: 'response' });
});

export default router;
```

### Update Data Model

1. Update types in `backend/src/models/`
2. Update validation schemas
3. Update database operations in `backend/src/services/`
4. Add migration if needed

---

## Troubleshooting

### GLM API Errors

**Error**: `invalid_authentication`
- Check API key in `.env`
- Verify key is active at https://open.bigmodel.cn/

**Error**: `rate_limit_exceeded`
- Wait before retrying
- Check plan limits

### Frontend Build Issues

**Error**: `VITE_API_URL is undefined`
- Ensure `.env` file exists in `frontend/`
- Restart dev server

### Database Issues

**Error**: `Cannot read conversations.json`
- Ensure `data/` directory exists
- Check file permissions

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b 002-your-feature
```

### 2. Make Changes

```bash
# Edit code
npm run lint          # Check linting
npm test             # Run tests
npm run test:coverage # Check coverage
```

### 3. Commit

```bash
git add .
git commit -m "feat(chat): add message editing"
```

### 4. Push and PR

```bash
git push origin 002-your-feature
# Create PR on GitHub
```

---

## Key Technologies

| Area | Technology |
|------|------------|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite |
| State Management | React Query + useState |
| Markdown | react-markdown |
| Code Highlighting | react-syntax-highlighter |
| Backend Framework | Express + TypeScript |
| Database | lowdb (JSON files) |
| AI API | GLM (OpenAI-compatible) |
| Testing | Vitest + React Testing Library + Playwright |
| Mocking | MSW |

---

## Constitution Compliance

This project follows the DeepSeek Chat Constitution:

- **TDD**: Tests written before implementation
- **Readability**: Clear naming, comments for complex logic
- **Component Conventions**: PascalCase components, camelCase utilities
- **Performance**: Response time budgets, caching strategy
- **Testing**: 80%+ coverage, mocked external services

See `.specify/memory/constitution.md` for full details.

---

## Useful Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run linter |
| `npm run lint:fix` | Fix linting issues |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |

---

## Resources

- **GLM API Docs**: https://open.bigmodel.cn/dev/api
- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com
- **Vite Docs**: https://vitejs.dev

---

## Getting Help

1. Check this quickstart guide
2. Review specs in `specs/001-glm-chat-app/`
3. Check contracts in `specs/001-glm-chat-app/contracts/`
4. Review constitution in `.specify/memory/constitution.md`

---

**Happy Coding! 🚀**
