import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ChatAvatar } from "./chat-avatar";

type FallbackAction = {
  label: string;
  controls?: string;
  expanded?: boolean;
  onClick: (trigger: HTMLButtonElement) => void;
};

export function ChatAvatarPhoto({
  fallbackAction,
  name,
  size = "md",
  url,
}: {
  fallbackAction?: FallbackAction;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  url: string | null;
}) {
  const { t } = useTranslation("chats");
  const [open, setOpen] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const avatar = <ChatAvatar name={name} size={size} url={url} />;

  if (!url) {
    return fallbackAction ? (
      <button
        aria-controls={fallbackAction.controls}
        aria-expanded={fallbackAction.expanded}
        aria-label={fallbackAction.label}
        className="shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        onClick={(event) => fallbackAction.onClick(event.currentTarget)}
        type="button"
      >
        {avatar}
      </button>
    ) : (
      avatar
    );
  }

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger asChild>
        <button
          aria-haspopup="dialog"
          aria-label={t("openAvatarPhoto", { name })}
          className="shrink-0 cursor-zoom-in rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          type="button"
        >
          {avatar}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-auth-artwork/90" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[71] flex h-dvh flex-col text-on-dark outline-none"
          onClick={(event) => {
            if (
              !(event.target instanceof Element) ||
              !event.target.closest("[data-avatar-photo]")
            ) {
              setOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setOpen(false);
            }
          }}
        >
          <header className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <Dialog.Title className="truncate text-sm font-medium">
              {t("avatarPhotoTitle", { name })}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label={t("closeAvatarPhoto")}
                className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-on-dark/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
                type="button"
              >
                <X aria-hidden="true" className="size-6" />
              </button>
            </Dialog.Close>
          </header>
          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            {failedUrl === url ? (
              <div
                className="flex flex-col items-center gap-4 text-center"
                data-avatar-photo
              >
                <ChatAvatar name={name} size="xl" url={null} />
                <p className="text-sm text-on-dark/70">
                  {t("photoUnavailable")}
                </p>
              </div>
            ) : (
              <img
                alt={name}
                className="max-h-full max-w-full object-contain"
                data-avatar-photo
                onError={() => setFailedUrl(url)}
                referrerPolicy="no-referrer"
                src={url}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
