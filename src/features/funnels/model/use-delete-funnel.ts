import { useMutation, useQueryClient } from "@tanstack/react-query";

import { channelsQueryKey } from "@/features/channels";

import { deleteFunnel, funnelsQueryKey } from "../api/funnels-api";

export function useDeleteFunnel(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFunnel,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: funnelsQueryKey(workspaceId),
      });
      void queryClient.invalidateQueries({
        queryKey: channelsQueryKey(workspaceId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["private", "inquiries", workspaceId],
      });
    },
  });
}
