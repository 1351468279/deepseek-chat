// Frontend shared types
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: {
    role: string;
    content: string;
    timestamp: string;
  };
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

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

export interface ConversationResponse extends Conversation {
  messages: Message[];
}

export interface MessagesListResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
}
