import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

const selectionBatchSize = 500;

export type NotificationRead = components["schemas"]["NotificationRead"];
export type NotificationScope = "workspace" | "personal";

export type NotificationReadFilter = "all" | "read" | "unread";
export type NotificationSort = "newest" | "oldest";

export type NotificationListParams = {
  search: string;
  read: NotificationReadFilter;
  sort: NotificationSort;
};

export type NotificationListResponse =
  components["schemas"]["NotificationList"];

export const notificationsQueryKey = (
  userId: string,
  scope: NotificationScope,
  workspaceId: string | null,
) =>
  [
    "private",
    "notifications",
    userId,
    scope,
    scope === "workspace" ? workspaceId : null,
  ] as const;

export const notificationListQueryKey = (
  userId: string,
  scope: NotificationScope,
  workspaceId: string | null,
  params: NotificationListParams,
) =>
  [
    ...notificationsQueryKey(userId, scope, workspaceId),
    "list",
    params,
  ] as const;

export const unreadNotificationCountQueryKey = (
  userId: string,
  scope: NotificationScope,
  workspaceId: string | null,
) =>
  [
    ...notificationsQueryKey(userId, scope, workspaceId),
    "unread-count",
  ] as const;

export async function listNotifications(
  params: NotificationListParams & { cursor?: string | null },
  scope: NotificationScope,
): Promise<NotificationListResponse> {
  const { data } = await api.get<NotificationListResponse>("/notifications", {
    params: { ...params, scope, limit: 50 },
    workspace: scope === "workspace",
  });
  return data;
}

export async function getUnreadNotificationCount(
  scope: NotificationScope,
): Promise<number> {
  const { data } = await api.get<components["schemas"]["UnreadCount"]>(
    "/notifications/unread-count",
    { params: { scope }, workspace: scope === "workspace" },
  );
  return data.count;
}

export async function markNotificationRead(
  id: string,
  scope: NotificationScope,
): Promise<void> {
  await api.patch(`/notifications/${encodeURIComponent(id)}/read`, null, {
    params: { scope },
    workspace: scope === "workspace",
  });
}

export async function markNotificationsRead(
  ids: string[],
  scope: NotificationScope,
): Promise<void> {
  for (let start = 0; start < ids.length; start += selectionBatchSize) {
    await api.patch(
      "/notifications/read",
      { ids: ids.slice(start, start + selectionBatchSize) },
      { params: { scope }, workspace: scope === "workspace" },
    );
  }
}

export async function deleteNotifications(
  ids: string[],
  scope: NotificationScope,
): Promise<void> {
  for (let start = 0; start < ids.length; start += selectionBatchSize) {
    await api.post(
      "/notifications/bulk-delete",
      { ids: ids.slice(start, start + selectionBatchSize) },
      { params: { scope }, workspace: scope === "workspace" },
    );
  }
}
