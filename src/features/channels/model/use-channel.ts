import { useQuery } from "@tanstack/react-query";

import { channelQueryKey, getChannel } from "../api/channels-api";

export function useChannel(workspaceId: string, channelId: string) {
  return useQuery({
    queryKey: channelQueryKey(workspaceId, channelId),
    queryFn: () => getChannel(channelId),
    enabled: Boolean(workspaceId && channelId),
    // A quick switch between chats on the same channel can reuse its details.
    // channel.changed still invalidates this query immediately.
    staleTime: 30_000,
  });
}
