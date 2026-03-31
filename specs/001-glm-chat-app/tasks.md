# Tasks: GLM Chat Application

**Input**: Design documents from `/specs/001-glm-chat-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This feature includes tests as per constitution requirements (TEST-001 through TEST-005). Tests MUST be written before implementation (TDD).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web application**: `backend/src/`, `frontend/src/`
- Paths shown below reflect the web app structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan (backend/, frontend/ directories)
- [x] T002 Initialize backend project with package.json dependencies (express, openai, lowdb, cors, dotenv, vitest, msw)
- [x] T003 Initialize frontend project with package.json dependencies (react, react-dom, react-router-dom, @tanstack/react-query, react-markdown, react-syntax-highlighter, vite, vitest, @testing-library/react, playwright, msw)
- [x] T004 [P] Create backend environment configuration files (.env.example, .gitignore, data/.gitkeep)
- [x] T005 [P] Create frontend environment configuration files (.env.example, .gitignore)
- [x] T006 [P] Configure ESLint and Prettier for backend with TypeScript rules
- [x] T007 [P] Configure ESLint and Prettier for frontend with React rules

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Setup lowdb database schema in backend/src/services/database.js with conversations and messages collections
- [x] T009 [P] Create shared TypeScript types in backend/src/types/index.ts (Message, Conversation, ChatRequest, ChatStreamEvent)
- [x] T010 [P] Create GLM API client service in backend/src/services/glmClient.js using openai SDK with custom baseURL
- [x] T011 [P] Create error handling middleware in backend/src/api/middleware/errorHandler.js
- [x] T012 [P] Create request validation middleware in backend/src/api/middleware/validation.js
- [x] T013 [P] Create base Conversation model in backend/src/models/Conversation.js
- [x] T014 [P] Create base Message model in backend/src/models/Message.js
- [x] T015 Create Express server in backend/src/server.js with CORS, JSON parser, and error middleware
- [x] T016 Create health check endpoint GET /api/health in backend/src/api/routes/health.js
- [x] T017 [P] Setup MSW handlers for GLM API mocking in backend/tests/mocks/glmApi.js
- [x] T018 [P] Setup MSW handlers for backend API mocking in frontend/tests/mocks/handlers.js
- [x] T019 [P] Setup Vitest configuration for backend tests (vitest.config.js)
- [x] T020 [P] Setup Vitest configuration for frontend tests (vitest.config.js)
- [x] T021 [P] Setup Playwright configuration for E2E tests (playwright.config.ts)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Send Chat Messages (Priority: P1) 🎯 MVP

**Goal**: Enable users to send messages and receive streaming AI responses

**Independent Test**: Open application, send a message, receive and display streaming AI response

### Tests for User Story 1 (TDD - Write FIRST, ensure they FAIL before implementation) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T022 [P] [US1] Contract test for POST /api/chat streaming in backend/tests/integration/chatStreaming.test.js
- [x] T023 [P] [US1] Integration test for GLM streaming response handling in backend/tests/integration/glmStream.test.js
- [x] T024 [P] [US1] Component test for ChatInterface in frontend/tests/component/ChatInterface.test.tsx

### Implementation for User Story 1

- [x] T025 [P] [US1] Create MessageStore service in backend/src/services/messageStore.js (create, findByConversation, getHistoryForGLM)
- [x] T026 [P] [US1] Create streamHandler utility in backend/src/utils/streamHandler.js (SSE formatting, cleanup)
- [x] T027 [US1] Implement chat streaming route POST /api/chat in backend/src/api/routes/chat.js (depends on T025, T026)
- [x] T028 [US1] Add retry logic with exponential backoff for GLM API calls in backend/src/services/glmClient.js
- [x] T029 [P] [US1] Create shared types in frontend/src/types/index.ts (Message, Conversation, ChatStreamEvent)
- [x] T030 [P] [US1] Create API client in frontend/src/services/api.ts (fetch wrapper, SSE handling)
- [x] T031 [US1] Create chatService in frontend/src/services/chatService.ts (sendMessage with streaming)
- [x] T032 [US1] Create useChat hook in frontend/src/hooks/useChat.ts (message state, streaming logic)
- [x] T033 [P] [US1] Create MessageInput component in frontend/src/components/ChatInterface/MessageInput.tsx (textarea, send button)
- [x] T034 [P] [US1] Create StreamingMessage component in frontend/src/components/ChatInterface/StreamingMessage.tsx (stream display)
- [x] T035 [P] [US1] Create MessageList component in frontend/src/components/ChatInterface/MessageList.tsx (message rendering)
- [x] T036 [US1] Create ChatInterface component in frontend/src/components/ChatInterface/ChatInterface.tsx (main chat UI)
- [x] T037 [P] [US1] Create MarkdownRenderer component in frontend/src/components/shared/MarkdownRenderer.tsx (react-markdown wrapper)
- [x] T038 [P] [US1] Create CodeBlock component in frontend/src/components/shared/CodeBlock.tsx (syntax highlighting)
- [x] T039 [P] [US1] Create LoadingIndicator component in frontend/src/components/shared/LoadingIndicator.tsx
- [x] T040 [US1] Implement keyboard shortcuts (Enter to send, Shift+Enter for newline) in MessageInput component
- [x] T041 [US1] Add stop streaming functionality to useChat hook
- [x] T042 [US1] Add error handling for GLM API failures in chat streaming route

**Checkpoint**: At this point, User Story 1 should be fully functional - users can send messages and receive streaming AI responses

---

## Phase 4: User Story 2 - View Chat History (Priority: P2)

**Goal**: Enable users to view and resume previous conversations

**Independent Test**: Send messages, close/reopen app, verify conversations are accessible and resumable

### Tests for User Story 2 (TDD - Write FIRST, ensure they FAIL before implementation) ⚠️

- [x] T043 [P] [US2] Contract test for GET /api/conversations in backend/tests/integration/conversationsList.test.js
- [x] T044 [P] [US2] Contract test for GET /api/conversations/:id in backend/tests/integration/conversationGet.test.js
- [x] T045 [P] [US2] Contract test for GET /api/conversations/:id/messages in backend/tests/integration/messagesList.test.js
- [x] T046 [P] [US2] Integration test for conversation persistence in backend/tests/integration/conversationPersistence.test.js
- [x] T047 [P] [US2] Component test for ConversationList in frontend/tests/component/ConversationList.test.tsx

### Implementation for User Story 2

- [x] T048 [P] [US2] Create ConversationStore service in backend/src/services/conversationStore.js (create, findById, findAll, update, delete)
- [x] T049 [P] [US2] Create titleGenerator utility in backend/src/utils/titleGenerator.js (auto-title from first message)
- [x] T050 [US2] Implement GET /api/conversations route in backend/src/api/routes/conversations.js (list with pagination)
- [x] T051 [US2] Implement GET /api/conversations/:id route in backend/src/api/routes/conversations.js (get with messages)
- [x] T052 [US2] Implement POST /api/conversations route in backend/src/api/routes/conversations.js (create new)
- [x] T053 [US2] Implement GET /api/conversations/:id/messages route in backend/src/api/routes/messages.js (paginated)
- [x] T054 [US2] Add conversation caching with React Query in frontend (5-minute stale time)
- [x] T055 [P] [US2] Create useConversations hook in frontend/src/hooks/useConversations.ts (list, create, select)
- [x] T056 [P] [US2] Create ConversationList component in frontend/src/components/ConversationList/ConversationList.tsx
- [x] T057 [P] [US2] Create ConversationItem component in frontend/src/components/ConversationList/ConversationItem.tsx (with last message preview)
- [x] T058 [P] [US2] Create NewChatButton component in frontend/src/components/ConversationList/NewChatButton.tsx
- [x] T059 [US2] Create conversationsService in frontend/src/services/conversationsService.ts (API calls)
- [x] T060 [US2] Implement conversation selection and message history loading in ChatPage
- [x] T061 [US2] Connect ChatInterface to conversation context (resume conversation)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can chat and see their conversation history

---

## Phase 5: User Story 3 - Manage Conversations (Priority: P3)

**Goal**: Enable users to create new chats, rename, and delete conversations

**Independent Test**: Create new chat, rename existing chat, delete chat - verify all operations work

### Tests for User Story 3 (TDD - Write FIRST, ensure they FAIL before implementation) ⚠️

- [x] T062 [P] [US3] Contract test for PATCH /api/conversations/:id in backend/tests/integration/conversationUpdate.test.js
- [x] T063 [P] [US3] Contract test for DELETE /api/conversations/:id in backend/tests/integration/conversationDelete.test.js
- [x] T064 [P] [US3] Component test for conversation rename UI in frontend/tests/component/ConversationRename.test.tsx
- [x] T065 [P] [US3] Component test for conversation delete UI in frontend/tests/component/ConversationDelete.test.tsx

### Implementation for User Story 3

- [x] T066 [US3] Implement PATCH /api/conversations/:id route in backend/src/api/routes/conversations.js (update title)
- [x] T067 [US3] Implement DELETE /api/conversations/:id route in backend/src/api/routes/conversations.js (cascade delete messages)
- [x] T068 [US3] Add cascade delete logic in ConversationStore (delete conversation and all messages)
- [x] T069 [P] [US3] Add rename functionality to useConversations hook
- [x] T070 [P] [US3] Add delete functionality to useConversations hook
- [x] T071 [P] [US3] Create ConversationItem rename UI in frontend/src/components/ConversationList/ConversationItem.tsx (edit mode)
- [x] T072 [P] [US3] Create ConversationItem delete UI in frontend/src/components/ConversationList/ConversationItem.tsx (delete button with confirmation)
- [x] T073 [US3] Update conversationsService with update and delete methods
- [x] T074 [US3] Add optimistic updates for rename/delete operations

**Checkpoint**: All user stories should now be independently functional - complete chat application

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T075 [P] Create ChatPage layout in frontend/src/pages/ChatPage.tsx (sidebar + main chat area)
- [x] T076 [P] Create App.tsx with React Router and layout structure in frontend/src/App.tsx
- [x] T077 [P] Create main.tsx entry point in frontend/src/main.tsx
- [x] T078 [P] Add responsive CSS for mobile compatibility in frontend/src/index.css
- [x] T079 [P] Add visual feedback for all user actions (loading, error, success states)
- [x] T080 Add rate limiting middleware to POST /api/chat endpoint (20 req/min)
- [x] T081 [P] Add input sanitization to prevent XSS (validate message length, strip HTML)
- [x] T082 [P] Add auto-scroll to latest message in MessageList component
- [x] T083 [P] Add memoization to MarkdownRenderer for performance
- [x] T084 [P] Add accessibility attributes (ARIA labels, keyboard navigation)
- [x] T085 [P] Unit tests for utility functions (titleGenerator, streamHandler)
- [x] T086 [P] Unit tests for services (messageStore, conversationStore)
- [x] T087 [P] E2E test for complete chat flow (send message, receive response) in frontend/tests/e2e/chatFlow.spec.ts
- [x] T088 [P] E2E test for conversation history (view, select, resume) in frontend/tests/e2e/conversationHistory.spec.ts
- [x] T089 [P] E2E test for conversation management (create, rename, delete) in frontend/tests/e2e/conversationManagement.spec.ts
- [x] T090 Run coverage reports and verify 80%+ coverage threshold
- [x] T091 Code cleanup and refactoring (use `/simplify` for review)
- [x] T092 Documentation updates (README, API docs)
- [x] T093 Security hardening (input validation, API key protection)
- [x] T094 Run quickstart.md validation and fix any issues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - No dependencies on other user stories
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion - No dependencies on other user stories
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion - Uses US2 components but can be developed in parallel
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses components from US2 but can be developed independently

### Within Each User Story

- Tests (TDD) MUST be written and FAIL before implementation
- Models before services
- Services before routes
- Backend routes before frontend integration
- Components before page integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, ALL three user stories can be developed in parallel
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - write first, verify they fail):
Task: T022 [P] [US1] Contract test for POST /api/chat streaming
Task: T023 [P] [US1] Integration test for GLM streaming response
Task: T024 [P] [US1] Component test for ChatInterface

# Launch all services for User Story 1 together:
Task: T025 [P] [US1] Create MessageStore service
Task: T026 [P] [US1] Create streamHandler utility
Task: T029 [P] [US1] Create shared types
Task: T030 [P] [US1] Create API client

# Launch all ChatInterface sub-components together:
Task: T033 [P] [US1] Create MessageInput component
Task: T034 [P] [US1] Create StreamingMessage component
Task: T035 [P] [US1] Create MessageList component
```

---

## Parallel Example: All User Stories (Team Development)

With multiple developers after Foundational phase:

```bash
# Developer A: User Story 1 (Chat)
T022-T042

# Developer B: User Story 2 (History) - can run in parallel with US1
T043-T061

# Developer C: User Story 3 (Management) - can run in parallel with US1/US2
T062-T074
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T021) - CRITICAL
3. Complete Phase 3: User Story 1 (T022-T042)
4. **STOP and VALIDATE**: Test chat functionality independently
5. Deploy/demo if ready

**MVP delivers**: Users can send messages and receive streaming AI responses

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T022-T042)
   - Developer B: User Story 2 (T043-T061)
   - Developer C: User Story 3 (T062-T074)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests MUST be written first (TDD) and verified to fail before implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution compliance: TDD mandatory, 80%+ test coverage, readability first
