import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ChannelProvider } from "../api/channels-api";

export function ConnectGuideDrawer({
  provider,
  open,
  onOpenChange,
}: {
  provider: ChannelProvider;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation("channels");
  const telegram = provider === "telegram_bot";
  const steps = telegram
    ? [t("guideTelegram1"), t("guideTelegram2"), t("guideTelegram3")]
    : [t("guideVk1"), t("guideVk2"), t("guideVk3")];
  const title = t(telegram ? "guideTitleTelegram" : "guideTitleVk");

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-[440px] flex-col bg-surface text-ink shadow-xl outline-none sm:inset-y-5 sm:right-5 sm:h-[calc(100dvh-40px)] sm:rounded-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
            <Dialog.Title className="text-lg font-semibold leading-tight">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label={t("closeGuide")}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{title}</Dialog.Description>
          <ol className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-6">
            {steps.map((step, index) => (
              <li className="flex gap-4" key={step}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                  {index + 1}
                </span>
                <p className="min-w-0 pt-1 text-sm leading-relaxed text-muted">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
