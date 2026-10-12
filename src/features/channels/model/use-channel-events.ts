import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  channelEventDetailQueryKey,
  channelEventsQueryKey,
  getChannelEvent,
  listChannelEvents,
} from "../api/channel-events-api";

export function useChannelEvents(workspaceId: string, channelId: string) {
  return useInfiniteQuery({
    queryKey: channelEventsQueryKey(workspaceId, channelId),
    queryFn: ({ pageParam }) => listChannelEvents(channelId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.next_cursor ?? undefined,
    enabled: Boolean(workspaceId && channelId),
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useChannelEventDetail(
  workspaceId: string,
  channelId: string,
  eventId: string,
  expanded: boolean,
) {
  return useQuery({
    queryKey: channelEventDetailQueryKey(workspaceId, channelId, eventId),
    queryFn: () => getChannelEvent(channelId, eventId),
    enabled: Boolean(workspaceId && channelId && eventId && expanded),
    gcTime: 0,
  });
}
