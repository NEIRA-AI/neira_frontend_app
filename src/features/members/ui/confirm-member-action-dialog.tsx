import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";

type ConfirmMemberActionDialogProps = {
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
};

export function ConfirmMemberActionDialog({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
}: ConfirmMemberActionDialogProps) {
  const { t } = useTranslation("members");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  function changeOpen(nextOpen: boolean) {
    if (busy) return;
    setOpen(nextOpen);
    setError(false);
  }

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root onOpenChange={changeOpen} open={open}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
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
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-5 text-muted">
            {description}
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              aria-label={t("closeDialog")}
              className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 sm:right-7 sm:top-7"
              disabled={busy}
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Close>
          {error && (
            <p className="mt-4 text-sm text-danger" role="alert">
              {t("actionError")}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button
              disabled={busy}
              onClick={() => changeOpen(false)}
              variant="ghost"
            >
              {t("cancel")}
            </Button>
            <Button
              disabled={busy}
              onClick={() => void confirm()}
              variant="danger"
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
