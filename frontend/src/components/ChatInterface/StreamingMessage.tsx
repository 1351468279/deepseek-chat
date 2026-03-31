import { useEffect, useRef } from 'react';
import type { Message } from '../../types';

interface StreamingMessageProps {
  message: Message;
  isStreaming?: boolean;
}

/**
 * StreamingMessage component - displays a message that is being streamed
 */
export function StreamingMessage({ message, isStreaming = false }: StreamingMessageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [message.content]);

  return (
    <div ref={containerRef} className={`message message-${message.role}`}>
      <div className="message-content">
        {isStreaming && <span className="streaming-cursor">▋</span>}
        <span>{message.content}</span>
      </div>
    </div>
  );
}
