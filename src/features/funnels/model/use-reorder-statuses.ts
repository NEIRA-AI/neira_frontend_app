import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  funnelsQueryKey,
  reorderStatuses,
  type FunnelRead,
} from "../api/funnels-api";

export function useReorderStatuses(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderStatuses,
    onMutate: async ({ funnelId, statusIds }) => {
      const key = funnelsQueryKey(workspaceId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FunnelRead[]>(key);
      queryClient.setQueryData<FunnelRead[]>(key, (current) =>
        current?.map((funnel) => {
          if (funnel.id !== funnelId) return funnel;
          const byId = new Map(
            funnel.statuses.map((status) => [status.id, status]),
          );
          return {
            ...funnel,
            statuses: statusIds
              .map((id, position) => {
                const status = byId.get(id);
                return status ? { ...status, position } : null;
              })
              .filter((status) => status !== null),
          };
        }),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(funnelsQueryKey(workspaceId), context?.previous);
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<FunnelRead[]>(
        funnelsQueryKey(workspaceId),
        (current) =>
          current?.map((funnel) => (funnel.id === saved.id ? saved : funnel)),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: funnelsQueryKey(workspaceId) }),
  });
}
