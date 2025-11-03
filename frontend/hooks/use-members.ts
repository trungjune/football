import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '@/lib/api-client';

// Get all members
export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get member by ID
export function useMember(id: string) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => membersApi.getById(id),
    enabled: !!id,
  });
}

// Create member mutation
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: membersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

// Update member mutation
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => membersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', id] });
    },
  });
}

// Delete member mutation
export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: membersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}
