import { apiClient } from './api';
import type { ChatRequest, ChatStreamEvent } from '../types';

/**
 * Chat service - handles chat API calls
 */

/**
 * Send a message and receive streaming response
 */
export async function sendMessage(
  request: ChatRequest,
  onChunk: (chunk: ChatStreamEvent) => void,
  onError: (error: string) => void
): Promise<void> {
  return new Promise((resolve) => {
    apiClient.streamChatRequest(
      request,
      onChunk,
      onError,
      () => resolve()
    );
  });
}

export const chatService = {
  sendMessage,
};
