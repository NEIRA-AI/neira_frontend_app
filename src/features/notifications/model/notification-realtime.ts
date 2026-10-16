import type {
  QueueRealtimeInvalidation,
  RealtimeChange,
  RealtimeEnvelope,
} from "@/shared/realtime/types";

import { notificationsQueryKey } from "../api/notifications-api";

export function handleNotificationRealtimeChange(
  change: RealtimeChange,
  envelope: RealtimeEnvelope,
  userId: string,
  workspaceId: string | null,
  invalidate: QueueRealtimeInvalidation,
) {
  if (change.kind !== "notification.changed") return;

  const notificationWorkspaceId =
    change.workspace_id ??
    (envelope.scope === "workspace" ? envelope.workspace_id : undefined);
  if (notificationWorkspaceId) {
    if (notificationWorkspaceId === workspaceId) {
      invalidate(
        notificationsQueryKey(userId, "workspace", notificationWorkspaceId),
      );
    }
  } else {
    invalidate(notificationsQueryKey(userId, "personal", null));
  }
}
