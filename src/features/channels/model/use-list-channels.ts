import { useQuery } from "@tanstack/react-query";

import { channelsQueryKey, listChannels } from "../api/channels-api";

export function useListChannels(workspaceId: string) {
  return useQuery({
    queryKey: channelsQueryKey(workspaceId),
    queryFn: listChannels,
    enabled: Boolean(workspaceId),
  });
}
