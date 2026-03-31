import { useState } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * MessageInput component - textarea for entering chat messages
 * Accessibility: ARIA labels, keyboard shortcuts (Enter to send, Shift+Enter for newline)
 */
export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend(value);
        setValue('');
      }
    }
  };

  return (
    <div className="message-input" role="presentation">
      <label htmlFor="message-textarea" className="visually-hidden">
        Type your message
      </label>
      <textarea
        id="message-textarea"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        aria-label="Message input"
        aria-describedby="message-input-hint"
        aria-invalid={false}
      />
      <span id="message-input-hint" className="visually-hidden">
        Press Enter to send, Shift+Enter for new line
      </span>
      <button
        onClick={() => {
          if (value.trim()) {
            onSend(value);
            setValue('');
          }
        }}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        type="submit"
      >
        Send
      </button>
    </div>
  );
}
