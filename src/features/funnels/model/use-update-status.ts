import { useMutation, useQueryClient } from "@tanstack/react-query";

import { funnelsQueryKey, updateStatus } from "../api/funnels-api";

export function useUpdateStatus(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: funnelsQueryKey(workspaceId) }),
  });
}
