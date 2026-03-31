import { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import { StreamingMessage } from './StreamingMessage';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
}

/**
 * MessageList component - displays chat messages
 * Accessibility: ARIA live region announces new messages to screen readers
 */
export function MessageList({ messages, isStreaming = false }: MessageListProps) {
  const listEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCount = useRef(messages.length);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className="message-list"
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Chat messages"
    >
      {messages.length === 0 && (
        <div className="empty-state" role="status">
          <p>No messages yet. Start a conversation!</p>
        </div>
      )}
      {messages.map(message => (
        <div
          key={message.id}
          className={`message message-${message.role}`}
          role="article"
          aria-label={`${message.role === 'user' ? 'You' : 'AI'} message at ${new Date(message.timestamp).toLocaleTimeString()}`}
        >
          <div className="message-header">
            <span className="message-role" aria-hidden="true">
              {message.role === 'user' ? 'You' : 'AI'}
            </span>
            <span className="message-timestamp" aria-label={`Sent at ${new Date(message.timestamp).toLocaleTimeString()}`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="message-content" tabIndex={0}>
            {message.role === 'assistant' ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              <p>{message.content}</p>
            )}
          </div>
        </div>
      ))}
      {isStreaming && (
        <StreamingMessage
          message={{
            id: 'streaming',
            conversationId: '',
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
          }}
          isStreaming={true}
        />
      )}
      <div ref={listEndRef} aria-hidden="true" />
    </div>
  );
}
