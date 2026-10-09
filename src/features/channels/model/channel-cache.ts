import type { QueryClient } from "@tanstack/react-query";

import {
  channelQueryKey,
  channelsQueryKey,
  type ChannelRead,
} from "../api/channels-api";

export function updateChannelCache(
  queryClient: QueryClient,
  workspaceId: string,
  channel: ChannelRead,
) {
  queryClient.setQueryData(channelQueryKey(workspaceId, channel.id), channel);
  void queryClient.invalidateQueries({
    queryKey: channelsQueryKey(workspaceId),
  });
}

export async function invalidateChannelCache(
  queryClient: QueryClient,
  workspaceId: string,
  channelId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: channelQueryKey(workspaceId, channelId),
    }),
    queryClient.invalidateQueries({
      queryKey: channelsQueryKey(workspaceId),
    }),
  ]);
}
