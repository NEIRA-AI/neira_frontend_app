import { Info, LoaderCircle } from "lucide-react";
import type { FormEventHandler } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

import type { ChannelOption } from "../channel-options";
import type { SetupDraft } from "../setup-draft";
import { ChannelHeading } from "./channel-heading";
import { SetupFields } from "./setup-fields";

type SetupChannelStepProps = {
  channel: ChannelOption;
  draft: SetupDraft;
  checking: boolean;
  onDraftChange: (patch: Partial<SetupDraft>) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onBack: () => void;
  onGuideOpen: () => void;
  onNotice: (message: string) => void;
  onCopyText: (value: string, successMessage: string) => void;
};

const availableSetupChannels = new Set([
  "telegram-premium",
  "telegram-bot",
  "telegram-personal",
  "max",
  "instagram",
  "facebook",
]);

export function SetupChannelStep({
  channel,
  draft,
  checking,
  onDraftChange,
  onSubmit,
  onBack,
  onGuideOpen,
  onNotice,
  onCopyText,
}: SetupChannelStepProps) {
  const { t } = useTranslation("channelConnectPreview");

  return (
    <>
      <ChannelHeading channel={channel} />
      {availableSetupChannels.has(channel.id) ? (
        <Card className="border-0 p-4 sm:p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">{t("setupTitle")}</h2>
              <button
                className="inline-flex items-center gap-1.5 text-sm text-brand underline underline-offset-2 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand"
                onClick={onGuideOpen}
                type="button"
              >
                <Info aria-hidden="true" className="size-4" />
                {t("howConnect")}
              </button>
            </div>
            <SetupFields
              channelId={channel.id}
              draft={draft}
              onCopyText={onCopyText}
              onDraftChange={onDraftChange}
              onNotice={onNotice}
            />
            <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
              <Button onClick={onBack} type="button" variant="secondary">
                {t("back")}
              </Button>
              <Button
                disabled={
                  checking ||
                  !draft.channelName.trim() ||
                  (channel.id === "telegram-personal" &&
                    draft.codePreview &&
                    draft.telegramCode.length !== 5)
                }
                type="submit"
              >
                {checking && (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                )}
                {t(
                  checking
                    ? "checking"
                    : channel.id === "telegram-personal"
                      ? draft.codePreview
                        ? "confirmCode"
                        : "getCode"
                      : channel.id === "instagram"
                        ? "connectInstagram"
                        : channel.id === "facebook"
                          ? "connectFacebook"
                          : "checkConnection",
                )}
              </Button>
            </div>
            <p className="text-xs text-muted">{t("previewNotice")}</p>
          </form>
        </Card>
      ) : (
        <Card className="space-y-3 border-0 p-6">
          <h2 className="font-semibold">{t("unsupportedTitle")}</h2>
          <p className="text-sm text-muted">{t("unsupportedDescription")}</p>
          <Button onClick={onBack} variant="secondary">
            {t("back")}
          </Button>
        </Card>
      )}
    </>
  );
}
