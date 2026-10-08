import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

import type {
  NotificationReadFilter,
  NotificationSort,
} from "../api/notifications-api";

type NotificationsToolbarProps = {
  search: string;
  read: NotificationReadFilter;
  sort: NotificationSort;
  onSearchChange: (value: string) => void;
  onReadChange: (value: NotificationReadFilter) => void;
  onSortChange: (value: NotificationSort) => void;
};

export function NotificationsToolbar({
  search,
  read,
  sort,
  onSearchChange,
  onReadChange,
  onSortChange,
}: NotificationsToolbarProps) {
  const { t } = useTranslation("notifications");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:min-w-60">
        <label className="sr-only" htmlFor="notification-search">
          {t("searchLabel")}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
        />
        <Input
          autoComplete="off"
          className="min-h-10 pl-11"
          id="notification-search"
          maxLength={120}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          type="search"
          value={search}
        />
      </div>
      <div className="flex gap-3">
        <Select
          ariaLabel={t("readFilterLabel")}
          className="min-w-0 flex-1 sm:w-40"
          onValueChange={(value) => {
            if (value === "all" || value === "read" || value === "unread") {
              onReadChange(value);
            }
          }}
          options={[
            { value: "all", label: t("all") },
            { value: "unread", label: t("unread") },
            { value: "read", label: t("read") },
          ]}
          value={read}
        />
        <Select
          ariaLabel={t("sortLabel")}
          className="min-w-0 flex-1 sm:w-40"
          onValueChange={(value) => {
            if (value === "newest" || value === "oldest") onSortChange(value);
          }}
          options={[
            { value: "newest", label: t("newest") },
            { value: "oldest", label: t("oldest") },
          ]}
          value={sort}
        />
      </div>
    </div>
  );
}
