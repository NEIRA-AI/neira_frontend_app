import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteStatus, funnelsQueryKey } from "../api/funnels-api";

export function useDeleteStatus(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: funnelsQueryKey(workspaceId) }),
  });
}
