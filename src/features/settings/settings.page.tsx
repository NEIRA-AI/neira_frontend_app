import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";
import { ImpersonationDialog } from "@/features/impersonation";
import { WorkspaceSettings } from "@/features/workspaces";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

import { useRemoveAvatar } from "./model/use-remove-avatar";
import { useUpdateProfile } from "./model/use-update-profile";
import { useUploadAvatar } from "./model/use-upload-avatar";
import { ProfileEditor } from "./ui/profile-editor";
import { SecuritySettings } from "./ui/security-settings";
import { SettingsNotice, type SettingsNoticeKind } from "./ui/settings-notice";
import { SettingsRow } from "./ui/settings-row";
import {
  InterfaceSettings,
  SettingsSection,
  SignOutSettings,
} from "./ui/settings-sections";

function SettingsPage() {
  const { t } = useTranslation("settings");
  const { t: impersonationT } = useTranslation("impersonation");
  const { user } = useAuth();
  const [notice, setNotice] = useState<SettingsNoticeKind | null>(null);
  const [impersonationOpen, setImpersonationOpen] = useState(false);
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
          {!user?.impersonation && (
            <SecuritySettings
              onPasswordChanged={() => setNotice("passwordChanged")}
            />
          )}
          {user?.platform_role === "admin" && !user.impersonation && (
            <SettingsSection title={impersonationT("settingsTitle")}>
              <Card className="overflow-hidden border-0">
                <SettingsRow label={impersonationT("settingsEntry")}>
                  <Button
                    className="min-h-8 rounded-lg bg-subtle px-3 text-xs font-bold text-ink hover:bg-subtle/80"
                    onClick={() => setImpersonationOpen(true)}
                    size="sm"
                    variant="secondary"
                  >
                    {impersonationT("settingsAction")}
                  </Button>
                </SettingsRow>
              </Card>
            </SettingsSection>
          )}
          <InterfaceSettings />
          <SignOutSettings />
        </div>
      </div>
      <ImpersonationDialog
        onOpenChange={setImpersonationOpen}
        open={impersonationOpen}
      />
    </div>
  );
}

export const Component = SettingsPage;
