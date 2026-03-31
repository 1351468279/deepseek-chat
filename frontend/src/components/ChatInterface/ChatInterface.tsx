import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { LoadingIndicator } from '../shared/LoadingIndicator';
import type { Message } from '../../types';

interface ChatInterfaceProps {
  conversationId?: string;
  onMessageComplete?: (message: Message) => void;
}

/**
 * ChatInterface component - main chat UI
 */
export function ChatInterface({ conversationId, onMessageComplete }: ChatInterfaceProps) {
  const { messages, isStreaming, error, sendMessage, stopStreaming } = useChat({
    conversationId: conversationId || 'temp', // Use temp ID for new chats
    onMessageComplete,
  });

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>Chat</h2>
        {isStreaming && (
          <button onClick={stopStreaming}>Stop</button>
        )}
      </div>

      <MessageList messages={messages} isStreaming={isStreaming} />

      {error && <div className="error-message">{error}</div>}

      {isStreaming && <LoadingIndicator />}

      <MessageInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
