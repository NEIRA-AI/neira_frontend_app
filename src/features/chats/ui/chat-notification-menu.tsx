import * as ContextMenu from "@radix-ui/react-context-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { useChatNotificationSettings } from "../model/chat-notification-context";

function ChatNotificationActions({
  conversationId,
  Item,
  onSaved,
}: {
  conversationId: string;
  Item: typeof DropdownMenu.Item;
  onSaved?: () => void;
}) {
  const { t } = useTranslation("chats");
  const { getSettings, isSaving, settingsReady, updateSettings } =
    useChatNotificationSettings();
  const { notificationsEnabled, soundEnabled } = getSettings(conversationId);
  const effectiveSoundEnabled = notificationsEnabled && soundEnabled;
  const [error, setError] = useState(false);
  const saving = isSaving(conversationId);

  async function changeSetting(patch: {
    notificationsEnabled?: boolean;
    soundEnabled?: boolean;
  }) {
    if (!settingsReady) return;
    setError(false);
    try {
      await updateSettings(conversationId, patch);
      onSaved?.();
    } catch {
      setError(true);
    }
  }

  return (
    <>
      <Item
        className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-brand-soft"
        disabled={saving || !settingsReady || !notificationsEnabled}
        onSelect={(event) => {
          event.preventDefault();
          void changeSetting({ soundEnabled: !soundEnabled });
        }}
      >
        {effectiveSoundEnabled ? (
          <VolumeX aria-hidden="true" className="size-4" />
        ) : (
          <Volume2 aria-hidden="true" className="size-4" />
        )}
        {t(effectiveSoundEnabled ? "muteSound" : "enableSound")}
      </Item>
      <Item
        className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-brand-soft"
        disabled={saving || !settingsReady}
        onSelect={(event) => {
          event.preventDefault();
          void changeSetting({
            notificationsEnabled: !notificationsEnabled,
            ...(!notificationsEnabled ? { soundEnabled: true } : {}),
          });
        }}
      >
        {notificationsEnabled ? (
          <BellOff aria-hidden="true" className="size-4" />
        ) : (
          <Bell aria-hidden="true" className="size-4" />
        )}
        {t(notificationsEnabled ? "muteNotifications" : "enableNotifications")}
      </Item>
      {!settingsReady && (
        <p className="px-3 py-2 text-xs text-muted" role="status">
          {t("notificationSettingsNotReady")}
        </p>
      )}
      {error && (
        <p className="px-3 py-2 text-xs text-danger" role="alert">
          {t("notificationSettingsError")}
        </p>
      )}
    </>
  );
}

export function ChatNotificationMenu({
  conversationId,
  onOpenChange,
  open,
  trigger,
}: {
  conversationId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  trigger: ReactElement;
}) {
  return (
    <DropdownMenu.Root onOpenChange={onOpenChange} open={open}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 min-w-56 rounded-xl border border-line bg-surface p-1 text-sm text-ink shadow-xl"
          collisionPadding={8}
          sideOffset={6}
        >
          <ChatNotificationActions
            conversationId={conversationId}
            Item={DropdownMenu.Item}
            onSaved={() => onOpenChange(false)}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function ChatNotificationContextMenu({
  conversationId,
  trigger,
}: {
  conversationId: string;
  trigger: ReactElement;
}) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{trigger}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className="z-50 min-w-56 rounded-xl border border-line bg-surface p-1 text-sm text-ink shadow-xl"
          collisionPadding={8}
        >
          <ChatNotificationActions
            conversationId={conversationId}
            Item={ContextMenu.Item}
          />
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
