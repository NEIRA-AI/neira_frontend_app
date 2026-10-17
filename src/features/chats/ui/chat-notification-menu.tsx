import * as ContextMenu from "@radix-ui/react-context-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type ReactElement } from "react";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closedByPointerRef = useRef(false);
  const openedByMouseRef = useRef(false);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    let closeTimer: number | null = null;

    function isPointerInside(rect: DOMRect | undefined, x: number, y: number) {
      if (!rect) return false;
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    }

    function isPointerBetween(
      trigger: DOMRect | undefined,
      content: DOMRect | undefined,
      x: number,
      y: number,
    ) {
      if (!trigger || !content) return false;
      if (x < Math.min(trigger.left, content.left)) return false;
      if (x > Math.max(trigger.right, content.right)) return false;
      if (trigger.bottom <= content.top)
        return y >= trigger.bottom && y <= content.top;
      if (content.bottom <= trigger.top)
        return y >= content.bottom && y <= trigger.top;
      return false;
    }

    function clearCloseTimer() {
      if (closeTimer !== null) window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !openedByMouseRef.current) return;
      const trigger = triggerRef.current?.getBoundingClientRect();
      const content = contentRef.current?.getBoundingClientRect();
      if (
        isPointerInside(trigger, event.clientX, event.clientY) ||
        isPointerInside(content, event.clientX, event.clientY) ||
        isPointerBetween(trigger, content, event.clientX, event.clientY)
      ) {
        clearCloseTimer();
      } else if (closeTimer === null) {
        closeTimer = window.setTimeout(() => {
          closeTimer = null;
          openedByMouseRef.current = false;
          closedByPointerRef.current = true;
          onOpenChangeRef.current(false);
        }, 180);
      }
    }

    function onKeyDown() {
      openedByMouseRef.current = false;
      clearCloseTimer();
    }

    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("keydown", onKeyDown, true);
      clearCloseTimer();
    };
  }, [open]);

  return (
    <DropdownMenu.Root
      onOpenChange={(nextOpen) => {
        if (nextOpen) closedByPointerRef.current = false;
        else openedByMouseRef.current = false;
        onOpenChange(nextOpen);
      }}
      open={open}
    >
      <DropdownMenu.Trigger
        asChild
        onKeyDown={() => {
          openedByMouseRef.current = false;
        }}
        onPointerDown={(event) => {
          openedByMouseRef.current = event.pointerType === "mouse";
        }}
        ref={triggerRef}
      >
        {trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 min-w-56 rounded-xl border border-line bg-surface p-1 text-sm text-ink shadow-xl"
          collisionPadding={8}
          onCloseAutoFocus={(event) => {
            if (closedByPointerRef.current) event.preventDefault();
            closedByPointerRef.current = false;
          }}
          ref={contentRef}
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
