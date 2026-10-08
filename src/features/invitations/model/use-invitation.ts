import { useQuery } from "@tanstack/react-query";

import { fetchInvitation } from "../api/invitations-api";

export function invitationQueryKey(token: string) {
  return ["public", "invitation", token] as const;
}

export function useInvitation(token: string | null) {
  return useQuery({
    queryKey: invitationQueryKey(token ?? ""),
    queryFn: () => fetchInvitation(token ?? ""),
    enabled: Boolean(token),
    gcTime: 60_000,
    retry: false,
    refetchOnWindowFocus: true,
  });
}
