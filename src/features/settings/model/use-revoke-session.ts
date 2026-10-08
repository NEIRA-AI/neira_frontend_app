import { useMutation, useQueryClient } from "@tanstack/react-query";

import { revokeSession, sessionsQueryKey } from "../api/sessions-api";

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey }),
  });
}
