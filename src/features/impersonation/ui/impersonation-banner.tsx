import { LogOut, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui/button";

export function ImpersonationBanner() {
  const { t } = useTranslation("impersonation");
  const { user, stopImpersonation } = useAuth();
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState(false);
  const actor = user?.impersonation;
  if (!actor || !user) return null;

  async function stop() {
    if (stopping) return;
    setStopping(true);
    setError(false);
    try {
      await stopImpersonation();
    } catch {
      setError(true);
    } finally {
      setStopping(false);
    }
  }

  return (
    <div
      aria-label={t("bannerPrefix")}
      className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-warning/30 bg-warning-soft px-4 text-warning-ink sm:px-6 lg:h-12"
    >
      <div className="flex min-w-0 items-center gap-2">
        <ShieldAlert aria-hidden="true" className="size-5 shrink-0" />
        <div className="min-w-0 text-xs sm:text-sm">
          <p
            className="truncate font-semibold"
            title={`${user.name.trim() || user.email} · ${user.email}`}
          >
            {t("bannerPrefix")} {user.name.trim() || user.email} · {user.email}
          </p>
          <p aria-live="polite" className="truncate opacity-80">
            {error
              ? t("bannerExitError")
              : t("bannerActor", { actor: actor.name.trim() || actor.email })}
          </p>
        </div>
      </div>
      <Button
        className="h-8 min-h-8 shrink-0 border-warning/30 bg-surface px-3 text-xs text-warning-ink hover:bg-warning-soft sm:text-sm"
        disabled={stopping}
        onClick={() => void stop()}
        size="sm"
        variant="outline"
      >
        <LogOut aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">{t("bannerExit")}</span>
        <span className="sm:hidden">{t("bannerExitShort")}</span>
      </Button>
    </div>
  );
}
