import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

const selectionBatchSize = 500;

export type NotificationRead = components["schemas"]["NotificationRead"];

export type NotificationReadFilter = "all" | "read" | "unread";
export type NotificationSort = "newest" | "oldest";

export type NotificationListParams = {
  search: string;
  read: NotificationReadFilter;
  sort: NotificationSort;
};

export type NotificationListResponse =
  components["schemas"]["NotificationList"];

export const notificationsQueryKey = (userId: string) =>
  ["private", "notifications", userId] as const;

export const notificationListQueryKey = (
  userId: string,
  params: NotificationListParams,
) => [...notificationsQueryKey(userId), "list", params] as const;

export const unreadNotificationCountQueryKey = (userId: string) =>
  [...notificationsQueryKey(userId), "unread-count"] as const;

export async function listNotifications(
  params: NotificationListParams & { cursor?: string | null },
): Promise<NotificationListResponse> {
  const { data } = await api.get<NotificationListResponse>("/notifications", {
    params: { ...params, limit: 50 },
  });
  return data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await api.get<components["schemas"]["UnreadCount"]>(
    "/notifications/unread-count",
  );
  return data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  for (let start = 0; start < ids.length; start += selectionBatchSize) {
    await api.patch("/notifications/read", {
      ids: ids.slice(start, start + selectionBatchSize),
    });
  }
}

export async function deleteNotifications(ids: string[]): Promise<void> {
  for (let start = 0; start < ids.length; start += selectionBatchSize) {
    await api.post("/notifications/bulk-delete", {
      ids: ids.slice(start, start + selectionBatchSize),
    });
  }
}
