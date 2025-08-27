import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCampaigns, createCampaign, deleteCampaign as del } from './api';

export function useCampaigns() {
  return useQuery({ queryKey: ['campaigns'], queryFn: listCampaigns });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

// NEW: delete mutation with optimistic update
export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => del(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['campaigns'] });
      const previous = qc.getQueryData(['campaigns']);
      qc.setQueryData(['campaigns'], (old) => (old ?? []).filter((c) => c.id !== id));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(['campaigns'], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
