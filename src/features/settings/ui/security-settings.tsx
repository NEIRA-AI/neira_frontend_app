import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { useAuth } from "@/features/auth";

import { useRevokeOtherSessions } from "../model/use-revoke-other-sessions";
import { useRevokeSession } from "../model/use-revoke-session";
import { useSessionsList } from "../model/use-sessions-list";
import { useTwoFactorStatus } from "../model/use-two-factor-status";
import { ChangePasswordDialog } from "./password-dialog";
import { SessionsDialog } from "./sessions-dialog";
import { SettingsRow } from "./settings-row";
import { SettingsSection } from "./settings-sections";
import { TwoFactorDialog } from "./two-factor-dialog";

export function SecuritySettings({
  onPasswordChanged,
}: {
  onPasswordChanged: () => void;
}) {
  const { t } = useTranslation("settings");
  const { user } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const sessions = useSessionsList(sessionsOpen);
  const twoFactor = useTwoFactorStatus(user?.id);
  const revoke = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();
  const busy = revoke.isPending || revokeOthers.isPending;
  const loading = sessions.isPending || (sessions.isFetching && !sessions.data);
  let error: "load" | "refresh" | "action" | null = null;
  if (!sessions.isFetching && sessions.isError) {
    error = sessions.data ? "refresh" : "load";
  } else if (revoke.isError || revokeOthers.isError) {
    error = "action";
  }

  function openSessions() {
    if (!revoke.isPending) revoke.reset();
    if (!revokeOthers.isPending) revokeOthers.reset();
    setSessionsOpen(true);
  }

  return (
    <>
      <SettingsSection title={t("security")}>
        <Card className="overflow-hidden border-0">
          <SettingsRow label={t("password")}>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <span aria-hidden="true">••••••••••••</span>
              <Button
                className="min-h-8 rounded-lg bg-subtle px-3 text-xs font-bold text-ink hover:bg-subtle/80"
                onClick={() => setPasswordOpen(true)}
                size="sm"
                variant="secondary"
              >
                {t("changePassword")}
              </Button>
            </div>
          </SettingsRow>
          <SettingsRow divider label={t("twoFactor")}>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <span
                className={
                  twoFactor.data?.enabled ? "text-success" : "text-muted"
                }
              >
                {twoFactor.isError
                  ? t("twoFactorStatusError")
                  : twoFactor.data
                    ? t(
                        twoFactor.data.enabled
                          ? "twoFactorEnabled"
                          : "twoFactorDisabled",
                      )
                    : t("twoFactorLoading")}
              </span>
              {twoFactor.isError ? (
                <Button
                  className="min-h-8 rounded-lg bg-subtle px-3 text-xs font-bold text-ink hover:bg-subtle/80"
                  onClick={() => void twoFactor.refetch()}
                  size="sm"
                  variant="secondary"
                >
                  {t("twoFactorRetry")}
                </Button>
              ) : (
                <Button
                  className="min-h-8 rounded-lg bg-subtle px-3 text-xs font-bold text-ink hover:bg-subtle/80"
                  disabled={!twoFactor.data}
                  onClick={() => setTwoFactorOpen(true)}
                  size="sm"
                  variant="secondary"
                >
                  {t(
                    twoFactor.data?.enabled
                      ? "twoFactorManage"
                      : "twoFactorConfigure",
                  )}
                </Button>
              )}
            </div>
          </SettingsRow>
          <SettingsRow divider label={t("activeSessions")}>
            <Button
              className="min-h-8 rounded-lg bg-subtle px-3 text-xs font-bold text-ink hover:bg-subtle/80"
              onClick={openSessions}
              size="sm"
              variant="secondary"
            >
              {t("viewSessions")}
            </Button>
          </SettingsRow>
        </Card>
      </SettingsSection>

      <ChangePasswordDialog
        onOpenChange={setPasswordOpen}
        onSuccess={() => {
          setPasswordOpen(false);
          onPasswordChanged();
        }}
        open={passwordOpen}
      />
      {twoFactor.data && (
        <TwoFactorDialog
          backupCodesRemaining={twoFactor.data.backup_codes_remaining}
          enabled={twoFactor.data.enabled}
          onOpenChange={setTwoFactorOpen}
          open={twoFactorOpen}
        />
      )}
      <SessionsDialog
        busy={busy}
        error={error}
        loading={loading}
        onOpenChange={setSessionsOpen}
        onRevoke={(id) => {
          revokeOthers.reset();
          revoke.mutate(id);
        }}
        onRevokeOthers={() => {
          revoke.reset();
          revokeOthers.mutate();
        }}
        open={sessionsOpen}
        sessions={sessions.data?.sessions ?? []}
      />
    </>
  );
}
