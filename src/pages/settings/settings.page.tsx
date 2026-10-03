import { CircleCheck, Info } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/features/change-language";
import { ThemeSwitcher } from "@/features/change-theme";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

import { ChangePasswordDialog } from "./ui/password-dialog";
import {
  ProfileEditor,
  type ProfileContact,
  type ProfileValue,
} from "./ui/profile-editor";
import { SettingsRow } from "./ui/settings-row";

const sampleContacts = [
  { kind: "telegram", value: "username" },
] as const satisfies readonly ProfileContact[];

const sampleProfile: ProfileValue = {
  name: "Alex Nikolaiev",
  contact: sampleContacts[0],
  avatar: null,
};
const sampleEmail = "alex1234@gmail";
const sampleCodeEmail = "test@test.com";
const selectClassName =
  "min-h-8 min-w-0 gap-1 border-0 bg-transparent px-0 font-bold text-muted hover:bg-transparent";

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="space-y-4">
      <h2 className="text-base font-semibold leading-[19px] text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SettingsPage() {
  const { t } = useTranslation("settings");
  const [profile, setProfile] = useState<ProfileValue>(sampleProfile);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [notice, setNotice] = useState<"profile" | "password" | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function applyProfile(next: ProfileValue) {
    setProfile(next);
    setNotice("profile");
  }

  return (
    <div className="min-h-full bg-page">
      {notice && (
        <div
          className={`fixed left-1/2 top-20 z-30 flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-2xl border bg-surface px-5 py-4 text-sm font-semibold text-ink shadow-lg lg:top-5 ${notice === "profile" ? "border-success/30" : "border-info/30"}`}
          role="status"
        >
          {notice === "profile" ? (
            <CircleCheck
              aria-hidden="true"
              className="size-5 shrink-0 text-success"
            />
          ) : (
            <Info aria-hidden="true" className="size-5 shrink-0 text-info" />
          )}
          {t(notice === "profile" ? "previewUpdated" : "passwordPreviewOnly")}
        </div>
      )}

      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <div className="mx-auto flex h-20 w-full max-w-4xl items-center px-4 sm:px-6 lg:px-8 2xl:max-w-5xl">
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 2xl:max-w-5xl">
        <ProfileEditor
          contactOptions={sampleContacts}
          email={sampleEmail}
          onApply={applyProfile}
          value={profile}
        />

        <div className="mt-12 space-y-12">
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
            </Card>
          </SettingsSection>

          <SettingsSection title={t("interface")}>
            <Card className="overflow-hidden border-0">
              <SettingsRow label={t("language")}>
                <LanguageSwitcher className={selectClassName} />
              </SettingsRow>
              <SettingsRow divider label={t("theme")}>
                <ThemeSwitcher className={selectClassName} />
              </SettingsRow>
              <SettingsRow divider label={t("accountTimezone")}>
                <Badge>{t("comingSoon")}</Badge>
              </SettingsRow>
            </Card>
          </SettingsSection>

          <Card className="overflow-hidden border-0">
            <SettingsRow label={t("sessionEnd")}>
              <button
                className="font-bold text-danger disabled:cursor-not-allowed"
                disabled
                title={t("unavailable")}
                type="button"
              >
                {t("signOut")}
              </button>
            </SettingsRow>
          </Card>
        </div>
      </div>

      <ChangePasswordDialog
        email={sampleCodeEmail}
        onOpenChange={setPasswordOpen}
        onPreviewComplete={() => {
          setPasswordOpen(false);
          setNotice("password");
        }}
        open={passwordOpen}
      />
    </div>
  );
}

export const Component = SettingsPage;
