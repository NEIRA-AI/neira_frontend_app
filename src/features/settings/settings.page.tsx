import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";
import { WorkspaceSettings } from "@/features/workspaces";

import { useRemoveAvatar } from "./model/use-remove-avatar";
import { useUpdateProfile } from "./model/use-update-profile";
import { useUploadAvatar } from "./model/use-upload-avatar";
import { ProfileEditor } from "./ui/profile-editor";
import { SecuritySettings } from "./ui/security-settings";
import { SettingsNotice, type SettingsNoticeKind } from "./ui/settings-notice";
import { InterfaceSettings, SignOutSettings } from "./ui/settings-sections";

function SettingsPage() {
  const { t } = useTranslation("settings");
  const { user } = useAuth();
  const [notice, setNotice] = useState<SettingsNoticeKind | null>(null);
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();

  return (
    <div className="min-h-full bg-page">
      <SettingsNotice notice={notice} onDismiss={setNotice} />

      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <div className="mx-auto flex h-20 w-full max-w-4xl items-center px-4 sm:px-6 lg:px-8 2xl:max-w-5xl">
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 2xl:max-w-5xl">
        {user && (
          <ProfileEditor
            key={user.id}
            avatarBusy={uploadAvatar.isPending || removeAvatar.isPending}
            onRemoveAvatar={async () => {
              await removeAvatar.mutateAsync();
              setNotice("profileSaved");
            }}
            onSave={async (input) => {
              await updateProfile.mutateAsync(input);
              setNotice("profileSaved");
            }}
            onUploadAvatar={async (file) => {
              await uploadAvatar.mutateAsync(file);
              setNotice("profileSaved");
            }}
            saving={updateProfile.isPending}
            user={user}
          />
        )}

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
