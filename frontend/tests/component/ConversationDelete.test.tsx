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
          messageCount: 1,
        },
      ])
    ),
    deleteConversation: vi.fn(() => Promise.resolve()),
  },
});

describe('Conversation Delete UI - Component Tests', () => {
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

  it('should show delete button for each conversation', async () => {
    const onDelete = vi.fn();
    render(
      <ConversationList
        conversations={[
          {
            id: '1',
            title: 'Test Conversation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 1,
          },
        ]}
        onSelect={() => {}}
        onCreateNew={() => {}}
        onDelete={onDelete}
      />,
      { wrapper }
    );

    const deleteButton = await screen.getAllByRole('button').find(btn =>
      btn.getAttribute('aria-label') === 'Delete conversation'
    );
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call delete when delete button clicked', async () => {
    const onDelete = vi.fn();
    window.confirm = vi.fn(() => true);

    render(
      <ConversationList
        conversations={[
          {
            id: '1',
            title: 'Test Conversation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 1,
          },
        ]}
        onSelect={() => {}}
        onCreateNew={() => {}}
        onDelete={onDelete}
      />,
      { wrapper }
    );

    const deleteButton = await screen.getAllByRole('button').find(btn =>
      btn.getAttribute('aria-label') === 'Delete conversation'
    );
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('1');
    });
  });

  it('should not delete if user cancels confirmation', async () => {
    const onDelete = vi.fn();
    window.confirm = vi.fn(() => false);

    render(
      <ConversationList
        conversations={[
          {
            id: '1',
            title: 'Test Conversation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 1,
          },
        ]}
        onSelect={() => {}}
        onCreateNew={() => {}}
        onDelete={onDelete}
      />,
      { wrapper }
    );

    const deleteButton = await screen.getAllByRole('button').find(btn =>
      btn.getAttribute('aria-label') === 'Delete conversation'
    );
    await userEvent.click(deleteButton);

    // Should not call delete
    expect(onDelete).not.toHaveBeenCalled();
  });
});
