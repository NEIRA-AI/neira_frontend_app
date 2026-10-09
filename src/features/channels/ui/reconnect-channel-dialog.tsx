import * as Dialog from "@radix-ui/react-dialog";
import { Info, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import type { ChannelRead } from "../api/channels-api";

export function ReconnectChannelDialog({
  channel,
  busy,
  error,
  onClose,
  onSubmit,
  onGuideOpen,
}: {
  channel: ChannelRead;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (token: string) => void;
  onGuideOpen: () => void;
}) {
  const { t } = useTranslation("channels");
  const [token, setToken] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (token.trim() && !busy) onSubmit(token.trim());
  }

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
            {t("reconnectTitle")}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-muted">
            {channel.name}. {t("reconnectDescription")}
          </Dialog.Description>
          <form className="mt-6 space-y-5" onSubmit={submit}>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label
                  className="block text-sm font-medium"
                  htmlFor="reconnect-token"
                >
                  {t(
                    channel.provider === "telegram_bot"
                      ? "telegramToken"
                      : "vkToken",
                  )}
                </label>
                <button
                  className="inline-flex items-center gap-1 text-sm text-brand hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand"
                  onClick={onGuideOpen}
                  type="button"
                >
                  <Info aria-hidden="true" className="size-4" />
                  {t("howConnect")}
                </button>
              </div>
              <Input
                aria-invalid={Boolean(error)}
                autoComplete="off"
                autoFocus
                disabled={busy}
                id="reconnect-token"
                onChange={(event) => setToken(event.target.value)}
                type="password"
                value={token}
              />
              {error && (
                <p className="mt-2 text-sm text-danger" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button disabled={busy} onClick={onClose} variant="outline">
                {t("cancel")}
              </Button>
              <Button disabled={busy || !token.trim()} type="submit">
                {t(busy ? "reconnecting" : "reconnectSubmit")}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
