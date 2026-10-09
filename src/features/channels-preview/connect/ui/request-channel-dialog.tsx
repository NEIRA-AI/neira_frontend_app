import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

type RequestChannelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RequestChannelDialog({
  open,
  onOpenChange,
}: RequestChannelDialogProps) {
  const { t } = useTranslation("channelConnectPreview");
  const nameId = useId();
  const contactId = useId();
  const [saved, setSaved] = useState(false);
  const [messenger, setMessenger] = useState("telegram");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <Dialog.Root
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setSaved(false);
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-8">
          <Dialog.Close asChild>
            <button
              aria-label={t("close")}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Close>
          <Dialog.Title className="pr-8 text-xl font-semibold">
            {t("requestTitle")}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-muted">
            {t("requestDescription")}
          </Dialog.Description>
          {saved ? (
            <div className="mt-6 space-y-5">
              <p
                className="rounded-xl bg-brand-soft p-4 text-sm text-brand"
                role="status"
              >
                {t("requestPreviewSaved")}
              </p>
              <Dialog.Close asChild>
                <Button className="w-full" type="button">
                  {t("close")}
                </Button>
              </Dialog.Close>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor={nameId}>
                  {t("requestChannelName")}
                </label>
                <Input id={nameId} required />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">{t("requestMessenger")}</p>
                <Select
                  ariaLabel={t("requestMessenger")}
                  className="w-full"
                  onValueChange={setMessenger}
                  options={[
                    { value: "telegram", label: t("requestTelegram") },
                    { value: "whatsapp", label: t("requestWhatsapp") },
                  ]}
                  value={messenger}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor={contactId}>
                  {t(
                    messenger === "telegram"
                      ? "requestTelegramNickname"
                      : "requestPhoneNumber",
                  )}
                </label>
                <Input
                  autoComplete={messenger === "telegram" ? "off" : "tel"}
                  id={contactId}
                  key={messenger}
                  required
                  type={messenger === "telegram" ? "text" : "tel"}
                />
              </div>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Dialog.Close asChild>
                  <Button type="button" variant="secondary">
                    {t("cancel")}
                  </Button>
                </Dialog.Close>
                <Button type="submit">{t("requestSubmit")}</Button>
              </div>
              <p className="text-xs text-muted">{t("requestNoSendPreview")}</p>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
