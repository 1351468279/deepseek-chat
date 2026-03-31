import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { ConversationList } from '../../src/components/ConversationList/ConversationList';

// Mock the conversationsService
vi.mock('../../src/services/conversationsService', () => ({
  conversationsService: {
    listConversations: vi.fn(() =>
      Promise.resolve([
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
      ])
    ),
    updateConversation: vi.fn(() =>
      Promise.resolve({
        id: '1',
        title: 'Updated Title',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 2,
      })
    ),
    deleteConversation: vi.fn(() => Promise.resolve()),
  },
}));

describe('Conversation Rename UI - Component Tests', () => {
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

  it('should enter edit mode on rename button click', async () => {
    const onRename = vi.fn();
    render(
      <ConversationList
        conversations={[
          {
            id: '1',
            title: 'Original Title',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 1,
          },
        ]}
        onSelect={() => {}}
        onCreateNew={() => {}}
        onRename={onRename}
      />,
      { wrapper }
    );

    const renameButton = await screen.getAllByRole('button').find(btn =>
      btn.getAttribute('aria-label') === 'Rename conversation'
    );
    await userEvent.click(renameButton);

    // Should show input with current title
    const input = screen.getByDisplayValue('Original Title');
    expect(input).toBeInTheDocument();
  });

  it('should save edited title on Enter key', async () => {
    const onRename = vi.fn();
    render(
      <ConversationList
        conversations={[
          {
            id: '1',
            title: 'Original Title',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 1,
          },
        ]}
        onSelect={() => {}}
        onCreateNew={() => {}}
        onRename={onRename}
      />,
      { wrapper }
    );

    // Start editing
    const renameButton = await screen.getAllByRole('button').find(btn =>
      btn.getAttribute('aria-label') === 'Rename conversation'
    );
    await userEvent.click(renameButton);

    // Change title
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'New Title');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(onRename).toHaveBeenCalledWith('1', 'New Title');
    });
  });

  it('should cancel edit on Escape key', async () => {
    render(
      <ConversationList
        conversations={[
          {
            id: '1',
            title: 'Original Title',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 1,
          },
        ]}
        onSelect={() => {}}
        onCreateNew={() => {}}
      />,
      { wrapper }
    );

    // Start editing
    const renameButton = await screen.getAllByRole('button').find(btn =>
      btn.getAttribute('aria-label') === 'Rename conversation'
    );
    await userEvent.click(renameButton);

    // Change title but cancel
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Cancelled Title');
    await userEvent.keyboard('{Escape}');

    // Input should be gone
    expect(screen.queryByDisplayValue('Cancelled Title')).not.toBeInTheDocument();
  });
});
