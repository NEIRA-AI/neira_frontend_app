import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/cn";

import type { NotificationRead } from "../api/notifications-api";

type NotificationCardProps = {
  notification: NotificationRead;
  selected: boolean;
  busy: boolean;
  onSelect: (id: string) => void;
  onOpen?: () => void;
};

export function NotificationCard({
  notification,
  selected,
  busy,
  onSelect,
  onOpen,
}: NotificationCardProps) {
  const { t, i18n } = useTranslation("notifications");
  const isUnread = notification.read_at === null;
  const date = new Date(notification.created_at);
  const formattedDate = Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);

  const content = (
    <>
      <span className="flex min-w-0 items-start gap-2.5">
        {isUnread && (
          <>
            <span
              aria-hidden="true"
              className="mt-2 size-2 shrink-0 rounded-full bg-brand-fill"
            />
            <span className="sr-only">{t("unread")}</span>
          </>
        )}
        <span className="min-w-0 text-base font-semibold text-ink">
          {notification.title}
        </span>
      </span>
      <span className="mt-1.5 block text-sm leading-6 text-muted-strong">
        {notification.description}
      </span>
      {formattedDate && (
        <time
          className="mt-3 block text-xs text-muted"
          dateTime={notification.created_at}
        >
          {formattedDate}
        </time>
      )}
    </>
  );

  return (
    <article
      className={cn(
        "flex items-start gap-4 rounded-2xl border bg-surface px-4 py-4 transition-colors sm:px-5",
        selected ? "border-brand bg-brand-soft" : "border-line",
        isUnread && !selected && "border-brand-20",
      )}
    >
      <input
        aria-label={t("selectNotification", { title: notification.title })}
        checked={selected}
        className="mt-1.5 size-4 shrink-0 cursor-pointer accent-brand-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed"
        disabled={busy}
        onChange={() => onSelect(notification.id)}
        type="checkbox"
      />
      {onOpen ? (
        <button
          className="group flex min-w-0 flex-1 items-start justify-between gap-4 text-left focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait"
          disabled={busy}
          onClick={onOpen}
          type="button"
        >
          <span className="min-w-0 flex-1">{content}</span>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-muted transition-colors group-hover:text-brand"
          />
        </button>
      ) : (
        <div className="min-w-0 flex-1">{content}</div>
      )}
    </article>
  );
}
