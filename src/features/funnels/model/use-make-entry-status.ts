import { useMutation, useQueryClient } from "@tanstack/react-query";

import { funnelsQueryKey, makeEntryStatus } from "../api/funnels-api";

export function useMakeEntryStatus(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: makeEntryStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: funnelsQueryKey(workspaceId) }),
  });
}
