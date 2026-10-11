import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import type { ContactSummary, ContactUpdate } from "../api/contacts-api";

export function EditContactDialog({
  contact,
  busy,
  errorMessage,
  onClose,
  onSave,
}: {
  contact: ContactSummary;
  busy: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSave: (request: ContactUpdate) => void;
}) {
  const { t } = useTranslation("contacts");
  const [name, setName] = useState(contact.display_name);
  const [email, setEmail] = useState(contact.email ?? "");
  const [phone, setPhone] = useState(contact.phone ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !name.trim()) return;
    onSave({
      display_name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
  }

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
            {t("editContactTitle")}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-5 text-muted">
            {t("editContactDescription")}
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
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block text-sm font-medium text-ink">
              {t("contactName")}
              <Input
                autoFocus
                className="mt-2"
                disabled={busy}
                maxLength={255}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              {t("email")}
              <Input
                autoComplete="email"
                className="mt-2"
                disabled={busy}
                maxLength={254}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                value={email}
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              {t("phone")}
              <Input
                autoComplete="tel"
                className="mt-2"
                disabled={busy}
                maxLength={32}
                onChange={(event) => setPhone(event.target.value)}
                type="tel"
                value={phone}
              />
            </label>
            {errorMessage && (
              <p className="text-sm text-danger" role="alert">
                {errorMessage}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <Button disabled={busy} onClick={onClose} variant="ghost">
                {t("cancel")}
              </Button>
              <Button disabled={busy || !name.trim()} type="submit">
                {busy ? t("saving") : t("save")}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
