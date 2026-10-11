import { useQuery } from "@tanstack/react-query";

import { getTwoFactorStatus, twoFactorQueryKey } from "../api/two-factor-api";

export function useTwoFactorStatus(userId: string | undefined) {
  return useQuery({
    queryKey: [...twoFactorQueryKey, userId],
    queryFn: getTwoFactorStatus,
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}
