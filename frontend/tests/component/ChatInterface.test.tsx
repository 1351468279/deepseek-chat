import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatInterface } from '../../src/components/ChatInterface/ChatInterface';

// Mock the chatService
vi.mock('../../src/services/chatService', () => ({
  sendMessage: vi.fn(),
}));

describe('ChatInterface Component', () => {
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

  it('should render message input', () => {
    render(<ChatInterface conversationId="test-id" />, { wrapper });

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render send button', () => {
    render(<ChatInterface conversationId="test-id" />, { wrapper });

    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should disable send button when input is empty', () => {
    render(<ChatInterface conversationId="test-id" />, { wrapper });

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when input has text', async () => {
    render(<ChatInterface conversationId="test-id" />, { wrapper });

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();
  });

  it('should display user messages', async () => {
    render(<ChatInterface conversationId="test-id" />, { wrapper });

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('should display loading indicator while streaming', async () => {
    const { sendMessage } = await import('../../src/services/chatService');
    sendMessage.mockImplementation(() => {
      return {
        async *[Symbol.asyncIterator]() {
          yield { content: 'Test' };
          yield { done: true };
        },
      };
    };

    render(<ChatInterface conversationId="test-id" />, { wrapper });

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
  });

  it('should support Enter to send', async () => {
    render(<ChatInterface conversationId="test-id" />, { wrapper });

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test message{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('should support Shift+Enter for newline', async () => {
    render(<ChatInterface conversationId="test-id" />, { wrapper });

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

    expect(input.value).toContain('\n');
  });
});
