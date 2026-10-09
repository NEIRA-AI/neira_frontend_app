import { useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "@/features/auth";

import type { NotificationRead } from "../api/notifications-api";
import type { NotificationScope } from "../api/notifications-api";
import type { NotificationTarget } from "./notification-target";
import { useMarkNotificationRead } from "./use-mark-notification-read";

export function useOpenNotification(userId: string, scope: NotificationScope) {
  const navigate = useNavigate();
  const { workspaceId, workspaces, selectWorkspace } = useAuth();
  const markRead = useMarkNotificationRead(userId, scope, workspaceId);
  const [isPending, setIsPending] = useState(false);

  async function openNotification(
    notification: NotificationRead,
    target: NotificationTarget,
  ): Promise<boolean> {
    if (isPending) return false;
    if (
      target.workspaceId &&
      !workspaces.some((workspace) => workspace.id === target.workspaceId)
    ) {
      return false;
    }

    setIsPending(true);
    try {
      if (notification.read_at === null) {
        try {
          await markRead.mutateAsync(notification.id);
        } catch {
          // Navigation still works when read-state sync fails.
        }
      }
      if (target.workspaceId && target.workspaceId !== workspaceId) {
        selectWorkspace(target.workspaceId);
      }
      await navigate(target.path);
      return true;
    } finally {
      setIsPending(false);
    }
  }

  return { openNotification, isPending };
}
