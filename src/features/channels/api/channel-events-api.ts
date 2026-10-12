import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type ChannelEvent = components["schemas"]["ChannelEventRead"];
export type ChannelEventDetail =
  components["schemas"]["ChannelEventDetailRead"];
export type ChannelEventPage = components["schemas"]["ChannelEventPageRead"];

export const channelEventsQueryKey = (workspaceId: string, channelId: string) =>
  ["private", "channels", workspaceId, channelId, "events"] as const;

export const channelEventDetailQueryKey = (
  workspaceId: string,
  channelId: string,
  eventId: string,
) =>
  [
    ...channelEventsQueryKey(workspaceId, channelId),
    "detail",
    eventId,
  ] as const;

export async function listChannelEvents(
  channelId: string,
  cursor: string | null,
): Promise<ChannelEventPage> {
  const { data } = await api.get<ChannelEventPage>(
    `/channels/${encodeURIComponent(channelId)}/events`,
    {
      params: { limit: 20, cursor: cursor ?? undefined },
      workspace: true,
    },
  );
  return data;
}

export async function getChannelEvent(
  channelId: string,
  eventId: string,
): Promise<ChannelEventDetail> {
  const { data } = await api.get<ChannelEventDetail>(
    `/channels/${encodeURIComponent(channelId)}/events/${encodeURIComponent(eventId)}`,
    { workspace: true },
  );
  return data;
}
