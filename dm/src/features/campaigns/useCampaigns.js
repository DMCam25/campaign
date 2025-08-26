import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCampaigns, createCampaign } from './api';

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
