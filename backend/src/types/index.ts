/**
 * Message entity - represents a single message in a conversation
 */
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
}

/**
 * Conversation entity - represents a single chat session
 */
export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

/**
 * Chat request from frontend
 */
export interface ChatRequest {
  message: string;
  conversationId?: string;
}

/**
 * Streaming event from backend
 */
export interface ChatStreamEvent {
  content?: string;
  error?: string;
  done?: boolean;
}

/**
 * GLM API message format
 */
export interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * GLM API request
 */
export interface GLMChatRequest {
  model: string;
  messages: GLMMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

/**
 * GLM API streaming chunk
 */
export interface GLMStreamChunk {
  id: string;
  object: string;
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
