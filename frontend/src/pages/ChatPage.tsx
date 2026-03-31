import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { useConversations } from '../hooks/useConversations';
import { ChatInterface } from '../components/ChatInterface/ChatInterface';
import { ConversationList } from '../components/ConversationList/ConversationList';
import type { Message, Conversation } from '../types';

/**
 * ChatPage - main chat page with sidebar and chat area
 */
export function ChatPage() {
  const { conversationId = 'new' } = useParams();
  const navigate = useNavigate();

  // Handle conversation selection
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(
    conversationId === 'new' ? undefined : conversationId
  );

  // Conversations hook
  const {
    conversations,
    createConversation,
    updateConversation,
    deleteConversation,
    isLoading: conversationsLoading,
  } = useConversations();

  // Handle conversation selection
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    navigate(`/chat/${id}`);
  };

  // Handle create new conversation
  const handleCreateNew = async () => {
    const newConv = await createConversation(undefined);
    setSelectedConversationId(newConv.id);
    navigate(`/chat/${newConv.id}`);
  };

  // Handle rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    updateConversation({ id, title: newTitle });
  };

  // Handle delete conversation
  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    if (selectedConversationId === id) {
      setSelectedConversationId(undefined);
      navigate('/chat/new');
    }
  };

  // Handle message complete - update conversation title on first message
  const handleMessageComplete = (message: Message) => {
    // If this is the first user message and title is "New Chat", generate title
    const conv = conversations.find(c => c.id === message.conversationId);
    if (conv && conv.title === 'New Chat' && message.role === 'user') {
      // Generate title from first message
      const title = message.content.substring(0, 40) + (message.content.length > 40 ? '...' : '');
      updateConversation({ id: conv.id, title });
    }
  };

  return (
    <div className="chat-page">
      <aside className="sidebar">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
          onCreateNew={handleCreateNew}
          onRename={handleRenameConversation}
          onDelete={handleDeleteConversation}
        />
      </aside>
      <main className="chat-area">
        <ChatInterface
          conversationId={selectedConversationId}
          onMessageComplete={handleMessageComplete}
        />
      </main>
    </div>
  );
}
