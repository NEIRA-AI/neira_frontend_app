import { useQuery } from "@tanstack/react-query";

import { channelQueryKey, getChannel } from "../api/channels-api";

export function useChannel(workspaceId: string, channelId: string) {
  return useQuery({
    queryKey: channelQueryKey(workspaceId, channelId),
    queryFn: () => getChannel(channelId),
    enabled: Boolean(workspaceId && channelId),
  });
}
