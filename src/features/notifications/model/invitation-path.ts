import { generatePath } from "react-router";

import type { NotificationRead } from "../api/notifications-api";

export function invitationPath(notification: NotificationRead): string | null {
  if (notification.kind !== "workspace_invitation") return null;

  const match = /^\/invites\/([A-Za-z0-9._~-]+)$/.exec(
    notification.target_path ?? "",
  );
  if (!match?.[1]) return null;

  return generatePath("/invites/:token", { token: match[1] });
}
