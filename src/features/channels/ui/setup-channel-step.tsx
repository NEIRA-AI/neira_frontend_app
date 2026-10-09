import { Info, LoaderCircle } from "lucide-react";
import type { FormEventHandler } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import type { ChannelProvider } from "../api/channels-api";
import type { SetupError } from "../model/use-connect-channel-flow";
import { providerDetails } from "../model/channel-presentation";

export function SetupChannelStep({
  provider,
  name,
  token,
  groupId,
  error,
  checking,
  onNameChange,
  onTokenChange,
  onGroupIdChange,
  onBack,
  onSubmit,
  onGuideOpen,
}: {
  provider: ChannelProvider;
  name: string;
  token: string;
  groupId: string;
  error: SetupError;
  checking: boolean;
  onNameChange: (value: string) => void;
  onTokenChange: (value: string) => void;
  onGroupIdChange: (value: string) => void;
  onBack: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onGuideOpen: () => void;
}) {
  const { t } = useTranslation("channels");
  const details = providerDetails(provider);

  return (
    <>
      <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
        <img alt="" className="size-6 object-contain" src={details.icon} />
        {t(details.label)}
      </h1>
      <Card className="mt-4 border-0 p-4 sm:p-6">
        <form className="space-y-5" onSubmit={onSubmit}>
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

          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="channel-name"
            >
              {t("channelName")}
            </label>
            <Input
              aria-invalid={error === "requiredName"}
              autoComplete="off"
              className="border-transparent bg-subtle"
              disabled={checking}
              id="channel-name"
              maxLength={120}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder={t("namePlaceholder")}
              value={name}
            />
            {error === "requiredName" && (
              <p className="mt-1.5 text-sm text-danger" role="alert">
                {t(error)}
              </p>
            )}
          </div>

          {provider === "vk_community" && (
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                htmlFor="vk-group-id"
              >
                {t("vkGroupId")}
              </label>
              <Input
                aria-invalid={
                  error === "invalidGroupId" || error === "invalidVkCommunity"
                }
                autoComplete="off"
                className="border-transparent bg-subtle"
                disabled={checking}
                id="vk-group-id"
                inputMode="numeric"
                onChange={(event) => onGroupIdChange(event.target.value)}
                placeholder={t("vkGroupIdPlaceholder")}
                value={groupId}
              />
              {(error === "invalidGroupId" ||
                error === "invalidVkCommunity") && (
                <p className="mt-1.5 text-sm text-danger" role="alert">
                  {t(error)}
                </p>
              )}
            </div>
          )}

          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="channel-token"
            >
              {t(provider === "telegram_bot" ? "telegramToken" : "vkToken")}
            </label>
            <Input
              aria-invalid={
                error === "requiredToken" ||
                error === "invalidToken" ||
                error === "missingPermissions"
              }
              autoComplete="off"
              className="border-transparent bg-subtle"
              disabled={checking}
              id="channel-token"
              onChange={(event) => onTokenChange(event.target.value)}
              placeholder={t(
                provider === "telegram_bot"
                  ? "telegramTokenPlaceholder"
                  : "vkTokenPlaceholder",
              )}
              type="password"
              value={token}
            />
            {error &&
              error !== "requiredName" &&
              error !== "invalidGroupId" &&
              error !== "invalidVkCommunity" && (
                <p className="mt-1.5 text-sm text-danger" role="alert">
                  {t(error)}
                </p>
              )}
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-brand-soft px-4 py-3 text-xs leading-5 text-brand-strong">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {t("secretHint")}
          </p>
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button
              disabled={checking}
              onClick={onBack}
              type="button"
              variant="secondary"
            >
              {t("back")}
            </Button>
            <Button disabled={checking} type="submit">
              {checking && (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              )}
              {t(checking ? "validating" : "validate")}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
