import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { ConversationList } from '../../src/components/ConversationList/ConversationList';

// Mock the conversationsService
vi.mock('../../src/services/conversationsService', () => ({
  conversationsService: {
    listConversations: vi.fn(() => Promise.resolve([
      {
        id: '1',
        title: 'Test Conversation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 2,
        lastMessage: {
          role: 'assistant',
          content: 'Test response',
          timestamp: new Date().toISOString(),
        },
      },
    ])),
    createConversation: vi.fn(() =>
      Promise.resolve({
        id: 'new-id',
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      })
    ),
  },
}));

describe('ConversationList Component', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should render conversation list', async () => {
    render(<ConversationList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });
  });

  it('should display last message preview', async () => {
    render(<ConversationList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Test response')).toBeInTheDocument();
    });
  });

  it('should show message count', async () => {
    render(<ConversationList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should create new conversation on new chat button click', async () => {
    const { conversationsService } = await import('../../src/services/conversationsService');
    render(<ConversationList />, { wrapper });

    const newButton = screen.getByText(/new chat/i);
    await userEvent.click(newButton);

    await waitFor(() => {
      expect(conversationsService.createConversation).toHaveBeenCalled();
    });
  });

  it('should show empty state when no conversations', async () => {
    const { conversationsService } = await import('../../src/services/conversationsService');
    conversationsService.listConversations.mockResolvedValueOnce([]);

    render(<ConversationList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/no conversations/i)).toBeInTheDocument();
    });
  });

  it('should select conversation on click', async () => {
    const onSelect = vi.fn();
    render(<ConversationList onSelect={onSelect} />, { wrapper });

    const conversationItem = await screen.findByText('Test Conversation');
    await userEvent.click(conversationItem);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('1');
    });
  });
});
