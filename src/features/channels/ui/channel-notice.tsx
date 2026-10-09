import { CircleAlert, CircleCheck, LoaderCircle, X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import type { ChannelNotice } from "../model/channel-notice";

export function ChannelNoticeToast({
  notice,
  onDismiss,
}: {
  notice: ChannelNotice;
  onDismiss: () => void;
}) {
  const { t } = useTranslation("channels");

  useEffect(() => {
    if (!notice || notice.kind === "loading") return;
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [notice, onDismiss]);

  if (!notice) return null;
  const Icon =
    notice.kind === "loading"
      ? LoaderCircle
      : notice.kind === "success"
        ? CircleCheck
        : CircleAlert;

  return (
    <div
      className="fixed left-1/2 top-20 z-50 flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink shadow-xl lg:top-5"
      role={notice.kind === "error" ? "alert" : "status"}
    >
      <Icon
        aria-hidden="true"
        className={`size-5 shrink-0 ${notice.kind === "loading" ? "animate-spin text-brand" : notice.kind === "success" ? "text-success" : "text-danger"}`}
      />
      <span>{notice.message}</span>
      {notice.kind !== "loading" && (
        <button
          aria-label={t("noticeClose")}
          className="rounded p-1 text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
          onClick={onDismiss}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}
