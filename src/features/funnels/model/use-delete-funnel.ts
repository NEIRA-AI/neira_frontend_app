import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteFunnel, funnelsQueryKey } from "../api/funnels-api";

export function useDeleteFunnel(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFunnel,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: funnelsQueryKey(workspaceId) }),
  });
}
