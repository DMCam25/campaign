// dm/src/features/user/useIdentity.js
import { useQuery } from '@tanstack/react-query';
import { whoAmI, dmPing } from './api';

export function useWhoAmI() {
  return useQuery({ queryKey: ['whoami'], queryFn: whoAmI });
}

export function useDmStatus() {
  return useQuery({
    queryKey: ['dmPing'],
    queryFn: dmPing,
    retry: false,              // if you’re not a DM, this would 403; don’t spam retries
  });
}
