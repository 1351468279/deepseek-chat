import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { Conversation, ConversationListResponse } from '../types';

/**
 * useConversations hook - manages conversation state
 */
export function useConversations() {
  const queryClient = useQueryClient();

  // List all conversations
  const {
    data: conversationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiClient.get<ConversationListResponse>('/conversations'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const conversations = conversationsData?.conversations || [];

  // Create new conversation
  const createMutation = useMutation({
    mutationFn: async (title?: string) => {
      return apiClient.post<Conversation>('/conversations', { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Update conversation title
  const updateMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      return apiClient.patch<Conversation>(`/conversations/${id}`, { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Delete conversation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    conversations,
    isLoading,
    error,
    refetch,
    createConversation: createMutation.mutate,
    updateConversation: updateMutation.mutate,
    deleteConversation: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
