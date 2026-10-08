import { useMutation, useQueryClient } from "@tanstack/react-query";

import { funnelsQueryKey, updateFunnel } from "../api/funnels-api";

export function useUpdateFunnel(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFunnel,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: funnelsQueryKey(workspaceId) }),
  });
}
