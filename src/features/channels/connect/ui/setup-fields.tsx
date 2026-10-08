import { Copy, Info } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import type { SetupDraft } from "../setup-draft";

const botUrl = "https://t.me/NeiraPremiumBot";

type SetupFieldsProps = {
  channelId: string;
  draft: SetupDraft;
  onDraftChange: (patch: Partial<SetupDraft>) => void;
  onNotice: (message: string) => void;
  onCopyText: (value: string, successMessage: string) => void;
};

export function SetupFields({
  channelId,
  draft,
  onDraftChange,
  onNotice,
  onCopyText,
}: SetupFieldsProps) {
  const { t } = useTranslation("channelConnect");
  const nameId = useId();
  const tokenId = useId();
  const phoneId = useId();
  const phoneErrorId = useId();
  const codeId = useId();

  return (
    <>
      <div className="space-y-2">
        <label className="text-xs text-muted" htmlFor={nameId}>
          {t("channelName")}
        </label>
        <Input
          className="border-transparent bg-subtle"
          id={nameId}
          onChange={(event) =>
            onDraftChange({ channelName: event.target.value })
          }
          required
          value={draft.channelName}
        />
      </div>

      {channelId === "telegram-premium" ? (
        <div className="border-t border-line pt-5">
          <h3 className="text-base font-semibold">{t("linkTitle")}</h3>
          <p className="mt-2 text-sm text-muted">{t("linkHint")}</p>
          <div className="mt-4 rounded-xl bg-brand-soft p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-fill text-sm font-bold text-on-brand"
              >
                N
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t("botName")}</p>
                <p className="text-xs text-muted">{t("botHandle")}</p>
              </div>
              <Button asChild size="sm">
                <a href={botUrl} rel="noopener noreferrer" target="_blank">
                  {t("open")}
                </a>
              </Button>
            </div>
            <div className="mt-3 flex min-w-0 items-center gap-2 rounded-lg bg-surface/70 px-3 py-2">
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-brand">
                {botUrl}
              </span>
              <button
                aria-label={t("copyLink")}
                className="shrink-0 rounded text-muted hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                onClick={() => onCopyText(botUrl, t("copySuccess"))}
                type="button"
              >
                <Copy aria-hidden="true" className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-muted">
              {t("pressStart")}
            </p>
          </div>
          <p className="mt-2 text-xs text-muted">{t("sampleLinkHint")}</p>
        </div>
      ) : channelId === "telegram-bot" || channelId === "max" ? (
        <div className="space-y-3 border-t border-line pt-5">
          <label className="block text-sm font-semibold" htmlFor={tokenId}>
            {t(channelId === "telegram-bot" ? "botToken" : "maxToken")}
          </label>
          <Input
            autoComplete="off"
            className="border-transparent bg-subtle"
            id={tokenId}
            placeholder={t(
              channelId === "telegram-bot"
                ? "botTokenPlaceholder"
                : "maxTokenPlaceholder",
            )}
            required
            type="password"
          />
          <div
            className={`flex gap-2 rounded-xl p-4 text-sm ${channelId === "max" ? "bg-warning-soft text-warning-ink" : "bg-brand-soft text-brand"}`}
          >
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              {channelId === "max" && (
                <strong className="mr-1">{t("securityTitle")}.</strong>
              )}
              {t(channelId === "max" ? "maxSecurity" : "botTokenWarning")}
            </p>
          </div>
        </div>
      ) : channelId === "telegram-personal" ? (
        <div className="space-y-5 border-t border-line pt-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-semibold" htmlFor={phoneId}>
                {t("phoneNumber")}
              </label>
              {draft.codePreview && (
                <button
                  className="text-sm text-brand hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand"
                  onClick={() =>
                    onDraftChange({ codePreview: false, telegramCode: "" })
                  }
                  type="button"
                >
                  {t("changePhone")}
                </button>
              )}
            </div>
            <Input
              aria-describedby={draft.phoneError ? phoneErrorId : undefined}
              aria-invalid={draft.phoneError}
              className="border-transparent bg-subtle"
              disabled={draft.codePreview}
              id={phoneId}
              inputMode="tel"
              onChange={(event) =>
                onDraftChange({ phone: event.target.value, phoneError: false })
              }
              placeholder={t("phonePlaceholder")}
              type="tel"
              value={draft.phone}
            />
            {draft.phoneError && (
              <p className="text-sm text-danger" id={phoneErrorId} role="alert">
                {t("phoneError")}
              </p>
            )}
          </div>
          {draft.codePreview && (
            <div className="space-y-3 border-t border-line pt-5">
              <h3 className="text-base font-semibold">
                {t("telegramCodeTitle")}
              </h3>
              <p className="text-sm text-muted">
                {t("telegramCodeDescription")}
              </p>
              <p className="text-xs text-muted">{t("codeNotSentPreview")}</p>
              <label className="block text-xs text-muted" htmlFor={codeId}>
                {t("telegramCodeLabel")}
              </label>
              <Input
                autoComplete="off"
                className="border-transparent bg-subtle"
                id={codeId}
                inputMode="numeric"
                maxLength={5}
                onChange={(event) =>
                  onDraftChange({
                    telegramCode: event.target.value.replace(/\D/g, ""),
                  })
                }
                value={draft.telegramCode}
              />
              <p className="text-xs text-muted">{t("resendDelay")}</p>
              <button
                className="text-sm text-brand hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand"
                onClick={() => onNotice(t("codeNotSentPreview"))}
                type="button"
              >
                {t("resendCode")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2 rounded-xl bg-brand-soft p-4 text-sm text-brand">
          <Info aria-hidden="true" className="size-4 shrink-0" />
          <p>{t(channelId === "instagram" ? "instagramApi" : "facebookApi")}</p>
        </div>
      )}
    </>
  );
}
