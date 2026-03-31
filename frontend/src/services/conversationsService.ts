import { apiClient } from './api';
import type { Conversation, ConversationListResponse, ConversationResponse } from '../types';

/**
 * ConversationsService - handles conversation API calls
 */
export class ConversationsService {
  /**
   * List all conversations
   */
  async listConversations(): Promise<Conversation[]> {
    const data = await apiClient.get<ConversationListResponse>('/conversations');
    return data.conversations;
  }

  /**
   * Get a single conversation with messages
   */
  async getConversation(id: string): Promise<ConversationResponse> {
    return apiClient.get<ConversationResponse>(`/conversations/${id}`);
  }

  /**
   * Create a new conversation
   */
  async createConversation(title?: string): Promise<Conversation> {
    return apiClient.post<Conversation>('/conversations', { title });
  }

  /**
   * Update conversation title
   */
  async updateConversation(id: string, title: string): Promise<Conversation> {
    return apiClient.patch<Conversation>(`/conversations/${id}`, { title });
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`/conversations/${id}`);
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    id: string,
    limit?: number,
    offset?: number
  ): Promise<{ messages: Conversation['messages']; total: number; hasMore: boolean }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const queryString = params.toString();
    return apiClient.get(`/conversations/${id}/messages${queryString ? `?${queryString}` : ''}`);
  }
}

export const conversationsService = new ConversationsService();
