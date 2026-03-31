import { useState, useCallback, useRef } from 'react';
import type { Message } from '../types';
import { chatService } from '../services/chatService';

interface UseChatOptions {
  conversationId: string;
  onMessageComplete?: (message: Message) => void;
}

interface UseChatReturn {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
}

/**
 * useChat hook - manages chat state and streaming
 */
export function useChat({ conversationId, onMessageComplete }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setError(null);
      setIsStreaming(true);

      // Add user message optimistically
      const userMessage: Message = {
        id: crypto.randomUUID(),
        conversationId: conversationId || 'temp',
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Prepare assistant message placeholder
      const assistantId = crypto.randomUUID();
      let assistantContent = '';

      try {
        // Don't send conversationId if it's 'temp' (new chat)
        const requestConversationId = conversationId === 'temp' ? undefined : conversationId;

        await chatService.sendMessage(
          { message: content, conversationId: requestConversationId },
          (chunk: { content?: string }) => {
            // Update streaming message
            if (chunk.content) {
              assistantContent += chunk.content;
              setMessages(prev => {
                const existing = prev.find(m => m.id === assistantId);
                if (existing) {
                  return prev.map(m =>
                    m.id === assistantId
                      ? { ...m, content: assistantContent }
                      : m
                  );
                }
                return [
                  ...prev,
                  {
                    id: assistantId,
                    conversationId: conversationId || 'temp',
                    role: 'assistant',
                    content: assistantContent,
                    timestamp: new Date().toISOString(),
                  },
                ];
              });
            }
          },
          (err: string) => {
            setError(err);
          }
        );

        // Message complete
        setIsStreaming(false);
        if (onMessageComplete) {
          onMessageComplete({
            id: assistantId,
            conversationId: conversationId || 'temp',
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        setIsStreaming(false);
      }
    },
    [conversationId, onMessageComplete]
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
  };
}
