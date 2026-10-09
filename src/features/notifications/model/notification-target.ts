import { generatePath } from "react-router";

import { channelDetailsPath, ROUTES } from "@/shared/config/routes";

import type { NotificationRead } from "../api/notifications-api";

const uuid =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
const channelPath = new RegExp(
  `^/channels/(${uuid})(?:\\?workspaceId=(${uuid}))?$`,
);

export type NotificationTarget = {
  path: string;
  workspaceId: string | null;
};

export function notificationTarget(
  notification: NotificationRead,
): NotificationTarget | null {
  const path = notification.target_path ?? "";

  if (notification.kind === "workspace_invitation") {
    const match = /^\/invites\/([A-Za-z0-9._~-]+)$/.exec(path);
    return match?.[1]
      ? {
          path: generatePath(ROUTES.INVITATION, { token: match[1] }),
          workspaceId: null,
        }
      : null;
  }

  if (notification.kind === "channel_reconnect_required") {
    const match = channelPath.exec(path);
    return match?.[1]
      ? {
          path: channelDetailsPath(match[1]),
          workspaceId: match[2] ?? null,
        }
      : null;
  }

  return null;
}
