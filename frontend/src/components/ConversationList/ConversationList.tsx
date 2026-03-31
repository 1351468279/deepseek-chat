import { useState } from 'react';
import type { Conversation } from '../../types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * ConversationList component - displays and manages conversations
 * Accessibility: ARIA labels, keyboard navigation, screen reader announcements
 */
export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onCreateNew,
  onRename,
  onDelete,
}: ConversationListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleStartEdit = (id: string, currentTitle: string) => {
      setEditingId(id);
      setEditValue(currentTitle);
    };

    const handleSaveEdit = (id: string) => {
      if (onRename && editValue.trim()) {
        onRename(id, editValue.trim());
      }
      setEditingId(null);
      setEditValue('');
    };

    const handleCancelEdit = () => {
      setEditingId(null);
      setEditValue('');
    };

    const handleDelete = (id: string) => {
      if (onDelete && window.confirm('Are you sure you want to delete this conversation?')) {
        onDelete(id);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(id);
      }
    };

    return (
      <div className="conversation-list" role="region" aria-label="Conversation list">
        <div className="conversation-list-header">
          <h3>Conversations</h3>
          <button
            onClick={onCreateNew}
            aria-label="Create new conversation"
            type="button"
          >
            + New Chat
          </button>
        </div>

        {conversations.length === 0 ? (
          <div className="empty-state" role="status">
            <p>No conversations yet</p>
            <p>Start a new chat to begin!</p>
          </div>
        ) : (
          <ul className="conversation-items" role="listbox" aria-label="Your conversations">
            {conversations.map(conv => (
              <li
                key={conv.id}
                className={`conversation-item ${
                  selectedId === conv.id ? 'active' : ''
                }`}
                onClick={() => onSelect(conv.id)}
                onKeyDown={e => handleKeyDown(e, conv.id)}
                role="option"
                aria-selected={selectedId === conv.id}
                tabIndex={selectedId === conv.id ? 0 : -1}
                aria-label={`${conv.title}, ${conv.messageCount} messages`}
              >
                {editingId === conv.id ? (
                  <div
                    className="conversation-edit"
                    onClick={e => e.stopPropagation()}
                    role="form"
                    aria-label="Edit conversation title"
                  >
                    <label htmlFor={`edit-input-${conv.id}`} className="visually-hidden">
                      Edit conversation title
                    </label>
                    <input
                      id={`edit-input-${conv.id}`}
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(conv.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      aria-label="Conversation title"
                    />
                    <button
                      onClick={() => handleSaveEdit(conv.id)}
                      aria-label="Save changes"
                      type="button"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      aria-label="Cancel editing"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="conversation-info">
                    <div className="conversation-title">{conv.title}</div>
                    <div className="conversation-meta">
                      <span aria-label={`${conv.messageCount} messages`}>
                        {conv.messageCount} messages
                      </span>
                      {conv.lastMessage && (
                        <span className="last-message">
                          {conv.lastMessage.content.substring(0, 50)}
                          {conv.lastMessage.content.length > 50 && '...'}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {editingId !== conv.id && (
                  <div className="conversation-actions">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleStartEdit(conv.id, conv.title);
                      }}
                      aria-label={`Rename ${conv.title}`}
                      type="button"
                    >
                      ✎️
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(conv.id);
                      }}
                      aria-label={`Delete ${conv.title}`}
                      type="button"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
}
