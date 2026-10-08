import {
  CircleAlert,
  CircleCheck,
  CirclePause,
  Info,
  RefreshCw,
} from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router";

import { ROUTES } from "@/shared/config/routes";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

import facebookIcon from "./assets/facebook.svg";
import instagramIcon from "./assets/instagram.png";
import telegramIcon from "./assets/telegram.png";
import whatsappIcon from "./assets/whatsapp.svg";
import {
  type ChannelPlatform,
  type ChannelPreview,
  type ChannelStatus,
} from "./model/channel-preview";
import { useChannelsPreview } from "./model/channels-preview-context";
import { useChannelEditPreview } from "./model/use-channel-edit-preview";
import { ChannelDialog } from "./ui/channel-dialog";

const platformIcons: Record<ChannelPlatform, string> = {
  telegramPremium: telegramIcon,
  telegramBot: telegramIcon,
  instagram: instagramIcon,
  facebook: facebookIcon,
  whatsapp: whatsappIcon,
};

const platformTitles: Record<ChannelPlatform, string> = {
  telegramPremium: "Telegram Premium",
  telegramBot: "Telegram Bot",
  instagram: "Instagram",
  facebook: "Facebook Messenger",
  whatsapp: "WhatsApp",
};

const statusTones: Record<
  ChannelStatus,
  "success" | "warning" | "brandSoft" | "danger"
> = {
  active: "success",
  stopped: "warning",
  checking: "brandSoft",
  needsCheck: "danger",
  error: "danger",
};

function ChannelEditView({ channel }: { channel: ChannelPreview }) {
  const { t } = useTranslation("channelEdit");
  const navigate = useNavigate();
  const { hash } = useLocation();
  const {
    draft,
    isDirty,
    nameIsEmpty,
    showPreviewNotice,
    turnOffOpen,
    updateDraft,
    savePreview,
    chooseEnabled,
    closeTurnOff,
    confirmTurnOff,
  } = useChannelEditPreview(channel, t("sampleAgent"));
  const status = channel.status;
  const statusKey =
    status === "active"
      ? "active"
      : status === "stopped"
        ? "stopped"
        : status === "checking"
          ? "checking"
          : status === "needsCheck"
            ? "needsCheck"
            : "error";
  const connectionKind =
    status === "active"
      ? "active"
      : status === "stopped"
        ? "stopped"
        : status === "checking"
          ? "checking"
          : "error";

  useEffect(() => {
    if (hash === "#connection" || hash === "#agent") {
      document.getElementById(hash.slice(1))?.scrollIntoView({
        block: "start",
      });
    }
  }, [hash]);

  return (
    <div className="min-h-full bg-page">
      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <div className="mx-auto flex h-20 w-full max-w-[708px] items-center px-4 sm:px-6">
          <nav aria-label={t("breadcrumb")} className="min-w-0 text-sm">
            <Link
              className="text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              to={ROUTES.CHANNELS}
            >
              {t("breadcrumb")}
            </Link>
            <span aria-hidden="true" className="mx-2 text-muted">
              /
            </span>
            <span className="text-muted-strong">
              {platformTitles[channel.platform]}
            </span>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[708px] px-4 pb-12 pt-8 sm:px-6">
        <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <img
              alt=""
              className="shrink-0 rounded-full"
              height="30"
              src={platformIcons[channel.platform]}
              width="30"
            />
            <h1 className="text-2xl font-bold text-ink">
              {platformTitles[channel.platform]}
            </h1>
            <Badge tone={statusTones[status]}>{t(statusKey)}</Badge>
          </div>

          <div
            aria-label={t("switchLabel")}
            className="inline-flex w-full shrink-0 rounded-xl bg-subtle p-1 sm:w-auto"
            role="group"
          >
            {([false, true] as const).map((enabled) => (
              <button
                key={String(enabled)}
                aria-pressed={draft.enabled === enabled}
                className={`min-h-9 flex-1 rounded-lg px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:flex-none ${
                  draft.enabled === enabled
                    ? enabled
                      ? "bg-success-soft text-success-ink"
                      : "bg-danger-soft text-danger"
                    : "text-muted hover:text-ink"
                }`}
                onClick={() => chooseEnabled(enabled)}
                type="button"
              >
                {t(enabled ? "enable" : "disable")}
              </button>
            ))}
          </div>
        </div>

        <form className="space-y-4" onSubmit={savePreview}>
          <Card className="space-y-5 border-0 p-4 sm:p-6">
            <h2 className="text-base font-semibold text-ink">
              {t("settings")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium text-muted"
                  htmlFor="channel-name"
                >
                  {t("channelName")}
                </label>
                <Input
                  aria-invalid={nameIsEmpty}
                  autoComplete="off"
                  className="min-h-11 border-transparent bg-subtle"
                  id="channel-name"
                  onChange={(event) =>
                    updateDraft({ name: event.target.value })
                  }
                  value={draft.name}
                />
                {nameIsEmpty && (
                  <p className="text-xs text-danger">{t("nameRequired")}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium text-muted"
                  htmlFor="channel-identifier"
                >
                  {t("identifier")}
                </label>
                <Input
                  className="min-h-11 border-transparent bg-subtle text-muted-strong"
                  id="channel-identifier"
                  readOnly
                  value={channel.identifier}
                />
              </div>
            </div>
          </Card>

          <Card
            className="scroll-mt-24 space-y-4 border-0 p-4 sm:p-6"
            id="connection"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-ink">
                  {t("connection")}
                </h2>
                <button
                  aria-label={t("recheck")}
                  className="text-muted disabled:cursor-not-allowed"
                  disabled
                  title={t("unavailable")}
                  type="button"
                >
                  <RefreshCw aria-hidden="true" className="size-4" />
                </button>
              </div>
              <span className="text-xs text-muted">
                {t("lastConnection", { date: t("sampleLastCheck") })}
              </span>
            </div>
            <p className="text-sm text-muted">
              {t(`${connectionKind}Description`)}
            </p>
            <div
              className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
                connectionKind === "active"
                  ? "bg-success-soft text-success-ink"
                  : connectionKind === "stopped"
                    ? "bg-danger-soft text-danger"
                    : connectionKind === "checking"
                      ? "bg-info-soft text-info"
                      : "bg-danger-soft text-danger"
              }`}
            >
              {connectionKind === "active" ? (
                <CircleCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
              ) : connectionKind === "stopped" ? (
                <CirclePause
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
              ) : connectionKind === "checking" ? (
                <RefreshCw
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
              ) : (
                <CircleAlert
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
              )}
              <span>{t(`${connectionKind}Info`)}</span>
            </div>
          </Card>

          <Card
            className="scroll-mt-24 space-y-4 border-0 p-4 sm:p-6"
            id="agent"
          >
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              {t("agent")}
              <Info aria-label={t("agentInfo")} className="size-4 text-muted" />
            </h2>
            <Select
              ariaLabel={t("agent")}
              className="w-full border-transparent bg-subtle"
              onValueChange={(agent) => updateDraft({ agent })}
              options={[
                { value: "none", label: t("selectAgent") },
                { value: "sample", label: t("sampleAgent") },
              ]}
              value={draft.agent}
            />
          </Card>

          {showPreviewNotice && (
            <p
              className="rounded-xl bg-info-soft px-4 py-3 text-sm text-info"
              role="status"
            >
              {t("previewSaved")}
            </p>
          )}

          <div className="flex justify-center gap-3 pt-6">
            <Button
              className="min-w-32"
              onClick={() => navigate(ROUTES.CHANNELS)}
              variant="outline"
            >
              {t("cancel")}
            </Button>
            <Button
              className="min-w-32"
              disabled={!isDirty || nameIsEmpty}
              type="submit"
            >
              {t("save")}
            </Button>
          </div>
        </form>
      </div>
      {turnOffOpen && (
        <ChannelDialog
          channel={channel}
          mode="turnOff"
          onClose={closeTurnOff}
          onConfirm={confirmTurnOff}
        />
      )}
    </div>
  );
}

function ChannelEditPage() {
  const { channelId } = useParams<"channelId">();
  const { t } = useTranslation("channelEdit");
  const { channels } = useChannelsPreview();
  const channel = channels.find((item) => item.id === channelId);

  if (!channel) {
    return (
      <div className="mx-auto flex min-h-full max-w-xl flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-ink">
          {t("missingChannel")}
        </h1>
        <Button asChild>
          <Link to={ROUTES.CHANNELS}>{t("backToChannels")}</Link>
        </Button>
      </div>
    );
  }

  return <ChannelEditView channel={channel} key={channel.id} />;
}

export const Component = ChannelEditPage;
