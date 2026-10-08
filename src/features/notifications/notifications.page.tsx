import { BellOff, RotateCcw, Settings2 } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui/button";

import type {
  NotificationRead,
  NotificationReadFilter,
  NotificationSort,
} from "./api/notifications-api";
import { invitationPath } from "./model/invitation-path";
import { useDeleteNotifications } from "./model/use-delete-notifications";
import { useListNotifications } from "./model/use-list-notifications";
import { useMarkNotificationRead } from "./model/use-mark-notification-read";
import { useMarkNotificationsRead } from "./model/use-mark-notifications-read";
import { NotificationBulkBar } from "./ui/notification-bulk-bar";
import { NotificationCard } from "./ui/notification-card";
import { NotificationsToolbar } from "./ui/notifications-toolbar";

function NotificationsUserPage({ userId }: { userId: string }) {
  const { t } = useTranslation("notifications");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [read, setRead] = useState<NotificationReadFilter>("all");
  const [sort, setSort] = useState<NotificationSort>("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [actionError, setActionError] = useState<"actionError" | null>(null);
  const deferredSearch = useDeferredValue(search.trim());
  const notificationsQuery = useListNotifications(userId, {
    search: deferredSearch,
    read,
    sort,
  });
  const markRead = useMarkNotificationRead(userId);
  const markSelectedRead = useMarkNotificationsRead(userId);
  const deleteSelected = useDeleteNotifications(userId);
  const items =
    notificationsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const unreadCount = notificationsQuery.data?.pages[0]?.unread_count ?? 0;
  const visibleSelectedIds = items
    .filter((item) => selectedIds.has(item.id))
    .map((item) => item.id);
  const allSelected =
    items.length > 0 && visibleSelectedIds.length === items.length;
  const actionBusy =
    markRead.isPending ||
    markSelectedRead.isPending ||
    deleteSelected.isPending;
  const hasActiveFilter = Boolean(search.trim()) || read !== "all";

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function toggleSelection(id: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function changeSearch(value: string) {
    setSearch(value);
    setActionError(null);
    clearSelection();
  }

  function changeRead(value: NotificationReadFilter) {
    setRead(value);
    setActionError(null);
    clearSelection();
  }

  function changeSort(value: NotificationSort) {
    setSort(value);
    setActionError(null);
    clearSelection();
  }

  async function openInvitation(notification: NotificationRead, path: string) {
    if (actionBusy) return;
    setActionError(null);
    if (notification.read_at === null) {
      try {
        await markRead.mutateAsync(notification.id);
      } catch {
        // Opening the invitation still works when read-state sync fails.
      }
    }
    void navigate(path);
  }

  async function markSelectionRead() {
    if (!visibleSelectedIds.length || actionBusy) return;
    setActionError(null);
    try {
      await markSelectedRead.mutateAsync(visibleSelectedIds);
      clearSelection();
    } catch {
      setActionError("actionError");
    }
  }

  async function deleteSelection() {
    if (!visibleSelectedIds.length || actionBusy) return;
    setActionError(null);
    try {
      await deleteSelected.mutateAsync(visibleSelectedIds);
      clearSelection();
    } catch {
      setActionError("actionError");
    }
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-page lg:min-h-dvh">
      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <div className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-strong">
                  {t("unreadCount", {
                    count: unreadCount,
                  })}
                </span>
              )}
            </div>
          </div>
          <span title={t("settingsSoon")}>
            <Button
              aria-label={t("settings")}
              disabled
              size="sm"
              variant="outline"
            >
              <Settings2 aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">{t("settings")}</span>
            </Button>
          </span>
        </div>
      </header>

      <div
        className={`mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8 ${visibleSelectedIds.length ? "pb-36" : "pb-10"}`}
      >
        <NotificationsToolbar
          onReadChange={changeRead}
          onSearchChange={changeSearch}
          onSortChange={changeSort}
          read={read}
          search={search}
          sort={sort}
        />

        {actionError && (
          <p
            className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            role="alert"
          >
            {t(actionError)}
          </p>
        )}
        {notificationsQuery.isError && notificationsQuery.data && (
          <div
            className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            role="alert"
          >
            <span>{t("loadError")}</span>
            <Button
              onClick={() => void notificationsQuery.refetch()}
              size="sm"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {t("retry")}
            </Button>
          </div>
        )}

        {notificationsQuery.isPending ? (
          <p className="py-12 text-center text-sm text-muted" role="status">
            {t("loading")}
          </p>
        ) : notificationsQuery.isError && !notificationsQuery.data ? (
          <div className="py-12 text-center">
            <p className="text-sm text-danger" role="alert">
              {t("loadError")}
            </p>
            <Button
              className="mt-4"
              onClick={() => void notificationsQuery.refetch()}
              size="sm"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {t("retry")}
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <BellOff aria-hidden="true" className="size-6" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-ink">
              {t("noNotifications")}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              {t(hasActiveFilter ? "noMatchesHelp" : "noNotificationsHelp")}
            </p>
          </div>
        ) : (
          <section aria-label={t("title")} className="mt-6">
            <label className="inline-flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-1 text-sm text-muted-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand">
              <input
                checked={allSelected}
                className="size-4 cursor-pointer accent-brand-fill disabled:cursor-not-allowed"
                disabled={actionBusy}
                onChange={() =>
                  setSelectedIds(
                    allSelected
                      ? new Set()
                      : new Set(items.map((item) => item.id)),
                  )
                }
                type="checkbox"
              />
              {t("selectAll")}
            </label>
            <div className="mt-2 grid gap-3">
              {items.map((notification) => {
                const path = invitationPath(notification);
                return (
                  <NotificationCard
                    key={notification.id}
                    busy={actionBusy}
                    notification={notification}
                    onOpen={
                      path
                        ? () => void openInvitation(notification, path)
                        : undefined
                    }
                    onSelect={toggleSelection}
                    selected={selectedIds.has(notification.id)}
                  />
                );
              })}
            </div>
            {notificationsQuery.hasNextPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  disabled={notificationsQuery.isFetchingNextPage}
                  onClick={() => void notificationsQuery.fetchNextPage()}
                  variant="outline"
                >
                  {notificationsQuery.isFetchingNextPage
                    ? t("loading")
                    : t("loadMore")}
                </Button>
              </div>
            )}
          </section>
        )}
      </div>

      {visibleSelectedIds.length > 0 && (
        <NotificationBulkBar
          busy={actionBusy}
          count={visibleSelectedIds.length}
          onClear={clearSelection}
          onDelete={() => void deleteSelection()}
          onMarkRead={() => void markSelectionRead()}
        />
      )}
    </div>
  );
}

function NotificationsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  return <NotificationsUserPage key={userId} userId={userId} />;
}

export const Component = NotificationsPage;
