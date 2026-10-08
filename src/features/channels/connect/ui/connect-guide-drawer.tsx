import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import botProfile from "../assets/telegram-bot-profile.png";
import botStart from "../assets/telegram-bot-start.png";
import businessBot from "../assets/telegram-business-bot.png";

type ConnectGuideDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel:
    | "telegram-premium"
    | "telegram-bot"
    | "telegram-personal"
    | "max"
    | "instagram"
    | "facebook";
};

export function ConnectGuideDrawer({
  open,
  onOpenChange,
  channel,
}: ConnectGuideDrawerProps) {
  const { t } = useTranslation("channelConnect");
  const premiumSteps = [
    {
      title: t("guideStep1Title"),
      description: t("guideStep1Description"),
      image: null,
    },
    {
      title: t("guideStep2Title"),
      description: t("guideStep2Description"),
      image: { src: botProfile, alt: t("guideImageBot"), height: 165 },
    },
    {
      title: t("guideStep3Title"),
      description: t("guideStep3Description"),
      image: { src: botStart, alt: t("guideImageStart"), height: 164 },
    },
    {
      title: t("guideStep4Title"),
      description: t("guideStep4Description"),
      image: {
        src: businessBot,
        alt: t("guideImageBusiness"),
        height: 152,
      },
    },
  ];
  const botSteps = [
    t("botGuideStep1"),
    t("botGuideStep2"),
    t("botGuideStep3"),
    t("botGuideStep4"),
  ];
  const isBot = channel === "telegram-bot";
  const isPremium = channel === "telegram-premium";
  const title = isPremium
    ? t("guideTitle")
    : isBot
      ? t("botGuideTitle")
      : channel === "telegram-personal"
        ? t("personalGuideTitle")
        : channel === "max"
          ? t("maxGuideTitle")
          : t("oauthGuideTitle");
  const description = isPremium
    ? t("guideDescription")
    : isBot
      ? t("botGuideDescription")
      : channel === "telegram-personal"
        ? t("personalGuideDescription")
        : channel === "max"
          ? t("maxGuideDescription")
          : t("oauthGuideDescription");
  const steps = isPremium ? premiumSteps : isBot ? botSteps : [description];

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="channel-guide-overlay fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content className="channel-guide-panel fixed inset-y-0 right-0 z-50 flex h-screen h-dvh w-full max-w-[440px] flex-col bg-surface text-ink shadow-xl outline-none sm:inset-y-5 sm:right-5 sm:h-[calc(100dvh-40px)] sm:rounded-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
            <div>
              <Dialog.Title className="text-lg font-semibold leading-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label={t("closeGuide")}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          <ol className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-6">
            {steps.map((step, index) => (
              <li
                className="flex gap-4"
                key={typeof step === "string" ? step : step.title}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                  {index + 1}
                </span>
                {typeof step === "string" ? (
                  <p className="min-w-0 pt-1 text-sm leading-relaxed text-muted">
                    {step}
                  </p>
                ) : (
                  <div className="min-w-0 space-y-2">
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {step.description}
                    </p>
                    {step.image && (
                      <img
                        alt={step.image.alt}
                        className="h-auto max-w-full rounded-xl"
                        height={step.image.height}
                        src={step.image.src}
                        width={253}
                      />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
