import { ChevronsUpDown } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";

export function AccountCard({
  collapsed,
  expanded,
  onToggle,
}: {
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation("dashboard");
  const { user } = useAuth();
  const contentId = useId();
  const name = user?.name?.trim() || user?.email || t("accountLabel");
  const initial = Array.from(name)[0]?.toLocaleUpperCase() ?? "?";

  if (collapsed) {
    return (
      <div
        aria-label={t("accountLabel")}
        className="flex h-20 items-center justify-center"
      >
        <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-brand-20 text-[21px] font-semibold text-brand-light">
          {user?.avatar_url ? (
            <img
              alt=""
              className="size-full object-cover"
              src={user.avatar_url}
            />
          ) : (
            initial
          )}
        </span>
      </div>
    );
  }

  return (
    <section
      className="mx-2 overflow-hidden rounded-xl border border-line bg-surface"
      aria-label={t("accountLabel")}
    >
      <button
        aria-controls={contentId}
        aria-expanded={expanded}
        aria-label={t(expanded ? "collapseAccount" : "expandAccount")}
        className="flex w-full items-center gap-2 bg-brand-soft px-3 py-3 text-left transition-colors hover:bg-brand-20 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand motion-reduce:transition-none"
        onClick={onToggle}
        type="button"
      >
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-20 text-[18px] font-semibold text-brand"
        >
          {user?.avatar_url ? (
            <img
              alt=""
              className="size-full object-cover"
              src={user.avatar_url}
            />
          ) : (
            initial
          )}
        </span>
        <span className="min-w-0 truncate text-[13px] font-semibold text-ink">
          {name}
        </span>
        <ChevronsUpDown
          aria-hidden="true"
          className="ml-auto size-4 shrink-0 text-muted"
        />
      </button>
      <div
        aria-hidden={!expanded}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        id={contentId}
        inert={!expanded}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-3 pb-3 pt-3">
            <div aria-hidden="true" className="h-0.5 rounded-full bg-line" />
            <div className="mt-3 flex items-center justify-between gap-2 text-[11px] leading-4 text-muted">
              <span>{t("contacts")}</span>
              {user?.telegram ? (
                <span className="min-w-0 truncate" title={user.telegram}>
                  {user.telegram}
                </span>
              ) : (
                <span aria-label={t("notAvailable")}>—</span>
              )}
            </div>
            <button
              className="mt-3 flex h-8 w-full cursor-not-allowed items-center justify-center rounded-lg bg-brand-fill text-[12px] font-medium text-on-brand"
              disabled
              title={t("comingSoon")}
              type="button"
            >
              {t("topUp")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
