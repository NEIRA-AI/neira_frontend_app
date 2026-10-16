import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";

import type { ContactSummary } from "../api/contacts-api";

export function DeleteContactDialog({
  contact,
  busy,
  conflict,
  errorMessage,
  onClose,
  onConfirm,
  onRefresh,
}: {
  contact: ContactSummary;
  busy: boolean;
  conflict: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
  onRefresh: () => void;
}) {
  const { t } = useTranslation("contacts");

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
      open
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-overlay" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[70] max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-7"
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <Dialog.Title className="pr-10 text-xl font-semibold">
            {t("deleteContactTitle")}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-5 text-muted">
            {t("deleteContactDescription", { name: contact.display_name })}
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              aria-label={t("closeDialog")}
              className="absolute right-5 top-5 grid size-8 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 sm:right-7 sm:top-7"
              disabled={busy}
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Close>
          {errorMessage && (
            <p className="mt-4 text-sm text-danger" role="alert">
              {errorMessage}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            {conflict && (
              <Button disabled={busy} onClick={onRefresh} variant="outline">
                {t("refreshContact")}
              </Button>
            )}
            <Button disabled={busy} onClick={onClose} variant="ghost">
              {t("cancel")}
            </Button>
            <Button
              disabled={busy || conflict}
              onClick={onConfirm}
              variant="danger"
            >
              {busy ? t("deleting") : t("delete")}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
