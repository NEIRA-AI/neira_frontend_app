import { useQuery } from "@tanstack/react-query";

import { funnelsQueryKey, listFunnels } from "../api/funnels-api";

export function useListFunnels(workspaceId: string) {
  return useQuery({
    queryKey: funnelsQueryKey(workspaceId),
    queryFn: listFunnels,
  });
}
