import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api-client';

// Get all sessions
export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsApi.getAll,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get session by ID
export function useSession(id: string) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => sessionsApi.getById(id),
    enabled: !!id,
  });
}

// Create session mutation
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

// Update session mutation
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      sessionsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', id] });
    },
  });
}

// Delete session mutation
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
