import type {
  QueueRealtimeInvalidation,
  RealtimeChange,
} from "@/shared/realtime/types";

import { channelQueryKey, channelsQueryKey } from "../api/channels-api";

export function handleChannelRealtimeChange(
  change: RealtimeChange,
  workspaceId: string,
  invalidate: QueueRealtimeInvalidation,
) {
  if (change.kind !== "channel.changed") return;

  if (change.channel_id) {
    invalidate(channelsQueryKey(workspaceId), true);
    invalidate(channelQueryKey(workspaceId, change.channel_id), true);
  } else {
    // Funnel deletion can detach channels without naming each affected ID.
    // Refresh active channel details as well as the channel list.
    invalidate(channelsQueryKey(workspaceId));
  }
}
