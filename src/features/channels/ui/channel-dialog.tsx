import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import type { ChannelPreview } from "../model/channel-preview";

export type ChannelDialogMode = "edit" | "delete" | "turnOff";

type ChannelDialogProps = {
  channel: ChannelPreview;
  mode: ChannelDialogMode;
  onClose: () => void;
  onConfirm: (name?: string, identifier?: string) => void;
};

export function ChannelDialog({
  channel,
  mode,
  onClose,
  onConfirm,
}: ChannelDialogProps) {
  const { t } = useTranslation("channels");
  const nameId = useId();
  const identifierId = useId();
  const [name, setName] = useState(channel.name);
  const [identifier, setIdentifier] = useState(channel.identifier);
  const isEdit = mode === "edit";
  const title = t(
    mode === "edit"
      ? "editTitle"
      : mode === "delete"
        ? "deleteTitle"
        : "turnOffTitle",
  );
  const description = t(
    mode === "edit"
      ? "editDescription"
      : mode === "delete"
        ? "deleteDescription"
        : "turnOffDescription",
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isEdit) {
      const nextName = name.trim();
      const nextIdentifier = identifier.trim();
      if (nextName && nextIdentifier) onConfirm(nextName, nextIdentifier);
    } else {
      onConfirm();
    }
  }

  return (
    <Dialog.Root onOpenChange={(open) => !open && onClose()} open>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-7">
          <Dialog.Close asChild>
            <button
              aria-label={t("close")}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Close>

          <Dialog.Title className="pr-10 text-xl font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-muted">
            {description}
          </Dialog.Description>

          <form className="mt-6" onSubmit={submit}>
            {isEdit && (
              <div className="space-y-4">
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-muted-strong"
                    htmlFor={nameId}
                  >
                    {t("nameLabel")}
                  </label>
                  <Input
                    id={nameId}
                    maxLength={80}
                    onChange={(event) => setName(event.target.value)}
                    required
                    value={name}
                  />
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-muted-strong"
                    htmlFor={identifierId}
                  >
                    {t("identifierLabel")}
                  </label>
                  <Input
                    id={identifierId}
                    maxLength={120}
                    onChange={(event) => setIdentifier(event.target.value)}
                    required
                    value={identifier}
                  />
                </div>
              </div>
            )}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button onClick={onClose} variant="outline">
                {t("cancel")}
              </Button>
              <Button
                disabled={isEdit && (!name.trim() || !identifier.trim())}
                type="submit"
                variant={isEdit ? "primary" : "danger"}
              >
                {t(
                  mode === "edit"
                    ? "save"
                    : mode === "delete"
                      ? "delete"
                      : "turnOffConfirm",
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
