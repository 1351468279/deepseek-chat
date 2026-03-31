interface NewChatButtonProps {
  onClick: () => void;
}

/**
 * NewChatButton component - creates a new conversation
 */
export function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <button className="new-chat-button" onClick={onClick}>
      + New Chat
    </button>
  );
}
