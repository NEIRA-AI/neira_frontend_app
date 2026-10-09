import { CircleCheck } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export type SettingsNoticeKind = "profileSaved" | "passwordChanged";

export function SettingsNotice({
  notice,
  onDismiss,
}: {
  notice: SettingsNoticeKind | null;
  onDismiss: (next: null) => void;
}) {
  const { t } = useTranslation("settings");

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => onDismiss(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice, onDismiss]);

  if (!notice) return null;

  return (
    <div
      className="fixed left-1/2 top-20 z-30 flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-success/30 bg-surface px-5 py-4 text-sm font-semibold text-ink shadow-lg lg:top-5"
      role="status"
    >
      <CircleCheck
        aria-hidden="true"
        className="size-5 shrink-0 text-success"
      />
      {t(notice === "profileSaved" ? "profileSaved" : "passwordChanged")}
    </div>
  );
}
