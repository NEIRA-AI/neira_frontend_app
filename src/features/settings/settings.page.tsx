import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth, type SessionUser } from "@/features/auth";
import { WorkspaceSettings } from "@/features/workspaces";

import { useProfilePreview } from "./hooks/use-profile-preview";
import { PreviewNotice, type PreviewNoticeKind } from "./ui/preview-notice";
import { ProfileEditor } from "./ui/profile-editor";
import { SecuritySettings } from "./ui/security-settings";
import { InterfaceSettings, SignOutSettings } from "./ui/settings-sections";

function ProfileSettings({
  user,
  onPreview,
}: {
  user: SessionUser | null;
  onPreview: () => void;
}) {
  const { profile, applyProfile } = useProfilePreview(user);

  return (
    <ProfileEditor
      email={user?.email ?? ""}
      emailVerified={user?.email_verified}
      onApply={(next) => {
        applyProfile(next);
        onPreview();
      }}
      value={profile}
    />
  );
}

function SettingsPage() {
  const { t } = useTranslation("settings");
  const { user } = useAuth();
  const [notice, setNotice] = useState<PreviewNoticeKind | null>(null);

  return (
    <div className="min-h-full bg-page">
      <PreviewNotice notice={notice} onDismiss={setNotice} />

      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <div className="mx-auto flex h-20 w-full max-w-4xl items-center px-4 sm:px-6 lg:px-8 2xl:max-w-5xl">
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 2xl:max-w-5xl">
        <ProfileSettings
          key={user?.id ?? "anonymous"}
          onPreview={() => setNotice("profile")}
          user={user}
        />

        <div className="mt-12 space-y-12">
          <WorkspaceSettings />
          <SecuritySettings
            onPasswordChanged={() => setNotice("passwordChanged")}
          />
          <InterfaceSettings />
          <SignOutSettings />
        </div>
      </div>
    </div>
  );
}

export const Component = SettingsPage;
