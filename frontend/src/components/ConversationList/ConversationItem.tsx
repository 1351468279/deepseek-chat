interface ConversationItemProps {
  conversation: {
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
  };
  isActive?: boolean;
  onClick: () => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * ConversationItem component - individual conversation in the list
 */
export function ConversationItem({
  conversation,
  isActive = false,
  onClick,
  onRename,
  onDelete,
}: ConversationItemProps) {
  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="conversation-title">{conversation.title}</div>
      <div className="conversation-meta">
        <span>{conversation.messageCount} messages</span>
        {conversation.lastMessage && (
          <span className="last-message">
            {conversation.lastMessage.content.substring(0, 50)}
            {conversation.lastMessage.content.length > 50 && '...'}
          </span>
        )}
        <span className="conversation-date">
          {new Date(conversation.updatedAt).toLocaleDateString()}
        </span>
      </div>
      {onRename && onDelete && (
        <div className="conversation-actions">
          <button onClick={() => onRename(conversation.id, conversation.title)}>
            Rename
          </button>
          <button onClick={() => onDelete(conversation.id)}>Delete</button>
        </div>
      )}
    </div>
  );
}
