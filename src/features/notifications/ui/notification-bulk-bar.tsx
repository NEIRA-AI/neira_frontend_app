import { Check, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

type NotificationBulkBarProps = {
  count: number;
  busy: boolean;
  onMarkRead: () => void;
  onDelete: () => void;
  onClear: () => void;
};

export function NotificationBulkBar({
  count,
  busy,
  onMarkRead,
  onDelete,
  onClear,
}: NotificationBulkBarProps) {
  const { t } = useTranslation("notifications");

  return (
    <div
      aria-label={t("bulkActions")}
      className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 flex-wrap items-center gap-2 rounded-2xl border border-on-dark/10 bg-auth-artwork p-3 text-on-dark shadow-2xl sm:bottom-6 sm:flex-nowrap sm:gap-3 sm:px-4"
      role="region"
    >
      <span
        aria-live="polite"
        className="min-w-0 basis-full px-1 pr-10 text-sm font-medium sm:flex-1 sm:basis-auto sm:pr-0"
      >
        {t("selectedCount", { count })}
      </span>
      <button
        className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm transition-colors hover:bg-on-dark/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark disabled:opacity-50 sm:flex-none"
        disabled={busy}
        onClick={onMarkRead}
        type="button"
      >
        <Check aria-hidden="true" className="size-4" />
        {t("markRead")}
      </button>
      <button
        className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm transition-colors hover:bg-on-dark/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark disabled:opacity-50 sm:flex-none"
        disabled={busy}
        onClick={onDelete}
        type="button"
      >
        <Trash2 aria-hidden="true" className="size-4" />
        {t("delete")}
      </button>
      <button
        aria-label={t("clearSelection")}
        className="absolute top-3 right-3 flex size-9 shrink-0 items-center justify-center rounded-lg text-on-dark/70 transition-colors hover:bg-on-dark/10 hover:text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark disabled:opacity-50 sm:static"
        disabled={busy}
        onClick={onClear}
        type="button"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
