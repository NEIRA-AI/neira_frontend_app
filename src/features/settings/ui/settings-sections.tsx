import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { useSignOut } from "@/features/auth";
import { LanguageSwitcher } from "@/features/change-language";
import { ThemeSwitcher } from "@/features/change-theme";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";

import { SettingsRow } from "./settings-row";

const selectClassName =
  "min-h-8 min-w-0 gap-1 border-0 bg-transparent px-0 font-bold text-muted hover:bg-transparent";

export function SettingsSection({
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

export function InterfaceSettings() {
  const { t } = useTranslation("settings");

  return (
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
  );
}

export function SignOutSettings() {
  const { t } = useTranslation("settings");
  const { signOut, signingOut } = useSignOut();

  return (
    <Card className="overflow-hidden border-0">
      <SettingsRow label={t("sessionEnd")}>
        <button
          className="font-bold text-danger hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          disabled={signingOut}
          onClick={() => void signOut()}
          type="button"
        >
          {t("signOut")}
        </button>
      </SettingsRow>
    </Card>
  );
}
