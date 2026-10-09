import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";

import type { ChannelRead } from "../api/channels-api";

export function ChannelActionDialog({
  channel,
  action,
  busy,
  onClose,
  onConfirm,
}: {
  channel: ChannelRead;
  action: "disconnect" | "delete";
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation("channels");

  return (
    <Dialog.Root onOpenChange={(open) => !open && !busy && onClose()} open>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-7">
          <Dialog.Close asChild>
            <button
              aria-label={t("cancel")}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
              disabled={busy}
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Close>
          <Dialog.Title className="pr-10 text-xl font-semibold">
            {t(action === "delete" ? "deleteTitle" : "disconnectTitle")}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-muted">
            {channel.name}.{" "}
            {t(
              action === "delete"
                ? "deleteDescription"
                : "disconnectDescription",
            )}
          </Dialog.Description>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button disabled={busy} onClick={onClose} variant="outline">
              {t("cancel")}
            </Button>
            <Button disabled={busy} onClick={onConfirm} variant="danger">
              {t(action === "delete" ? "deleteConfirm" : "disconnectConfirm")}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
