import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createFunnel, funnelsQueryKey } from "../api/funnels-api";

export function useCreateFunnel(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFunnel,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: funnelsQueryKey(workspaceId) }),
  });
}
