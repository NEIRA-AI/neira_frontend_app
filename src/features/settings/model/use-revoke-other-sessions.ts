import { useMutation, useQueryClient } from "@tanstack/react-query";

import { revokeOtherSessions, sessionsQueryKey } from "../api/sessions-api";

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeOtherSessions,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey }),
  });
}
