import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Bot,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  RefreshCw,
  Trash2,
  Wifi,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/cn";

import facebookIcon from "../assets/facebook.svg";
import instagramIcon from "../assets/instagram.png";
import telegramIcon from "../assets/telegram.png";
import whatsappIcon from "../assets/whatsapp.svg";
import type {
  ChannelPlatform,
  ChannelPreview,
  ChannelStatus,
} from "../model/channel-preview";

export type ChannelAction =
  "open" | "edit" | "check" | "changeAgent" | "reconnect" | "toggle" | "delete";

type ChannelsPreviewListProps = {
  channels: ChannelPreview[];
  onAction: (action: ChannelAction, channel: ChannelPreview) => void;
};

const platformIcons: Record<ChannelPlatform, string> = {
  telegramPremium: telegramIcon,
  telegramBot: telegramIcon,
  instagram: instagramIcon,
  whatsapp: whatsappIcon,
  facebook: facebookIcon,
};

const platformLabels: Record<ChannelPlatform, string> = {
  telegramPremium: "Telegram",
  telegramBot: "Telegram",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
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

function ChannelIdentity({
  channel,
  onOpen,
}: {
  channel: ChannelPreview;
  onOpen: () => void;
}) {
  return (
    <button
      className="flex min-w-0 items-center gap-3 text-left focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      onClick={onOpen}
      type="button"
    >
      <span className="relative shrink-0">
        <img
          alt=""
          className="size-[30px] rounded-full"
          height="30"
          src={platformIcons[channel.platform]}
          width="30"
        />
        {channel.status === "active" && (
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-surface bg-success" />
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold text-ink">
          {platformLabels[channel.platform]}
        </span>
        <span className="truncate text-xs text-muted">{channel.name}</span>
      </span>
    </button>
  );
}

function ChannelStatusBadge({ status }: { status: ChannelStatus }) {
  const { t } = useTranslation("channelsPreview");
  return <Badge tone={statusTones[status]}>{t(status)}</Badge>;
}

function ChannelActions({
  channel,
  onAction,
}: {
  channel: ChannelPreview;
  onAction: ChannelsPreviewListProps["onAction"];
}) {
  const { t } = useTranslation("channelsPreview");
  const isActive = channel.status === "active";
  const menuItems = [
    { action: "edit", icon: Pencil, label: t("edit") },
    { action: "check", icon: Wifi, label: t("checkConnection") },
    { action: "changeAgent", icon: Bot, label: t("changeAgent") },
    { action: "reconnect", icon: RefreshCw, label: t("reconnect") },
    {
      action: "toggle",
      icon: isActive ? Pause : Play,
      label: t(isActive ? "stop" : "activate"),
    },
  ] as const;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={`${t("actions")}: ${platformLabels[channel.platform]}`}
          className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          type="button"
        >
          <MoreVertical aria-hidden="true" className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 min-w-52 rounded-xl border border-line bg-surface p-1 text-sm text-ink shadow-xl outline-none"
          sideOffset={6}
        >
          {menuItems.map(({ action, icon: Icon, label }) => (
            <DropdownMenu.Item
              key={action}
              className="flex min-h-9 cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 outline-none data-highlighted:bg-brand-soft data-highlighted:text-brand-strong"
              onSelect={() => onAction(action, channel)}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item
            className="flex min-h-9 cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 text-danger outline-none data-highlighted:bg-danger-soft"
            onSelect={() => onAction("delete", channel)}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            {t("delete")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function ChannelsPreviewList({
  channels,
  onAction,
}: ChannelsPreviewListProps) {
  const { t } = useTranslation("channelsPreview");

  return (
    <>
      <div className="grid gap-3 xl:hidden">
        {channels.map((channel) => (
          <article
            key={channel.id}
            className="rounded-2xl border border-line bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <ChannelIdentity
                channel={channel}
                onOpen={() => onAction("open", channel)}
              />
              <ChannelActions channel={channel} onAction={onAction} />
            </div>
            <dl className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 border-t border-line pt-4 text-xs">
              <dt className="text-muted">{t("status")}</dt>
              <dd className="text-right">
                <ChannelStatusBadge status={channel.status} />
              </dd>
              <dt className="text-muted">{t("agent")}</dt>
              <dd className="text-right text-ink">
                {channel.agent ?? t("noAgent")}
              </dd>
              <dt className="text-muted">{t("identifier")}</dt>
              <dd className="max-w-44 truncate text-right font-mono text-ink">
                {channel.identifier}
              </dd>
              <dt className="text-muted">{t("lastCheck")}</dt>
              <dd className="text-right text-ink">{channel.lastCheck}</dd>
            </dl>
          </article>
        ))}
      </div>

      <div
        aria-label={t("title")}
        className="hidden overflow-x-auto rounded-2xl border border-line bg-surface xl:block"
        role="region"
        tabIndex={0}
      >
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-xs font-medium text-muted">
              <th className="w-[22%] px-5 py-4 font-medium" scope="col">
                {t("channel")}
              </th>
              <th className="w-[15%] px-4 py-4 font-medium" scope="col">
                {t("status")}
              </th>
              <th className="w-[19%] px-4 py-4 font-medium" scope="col">
                {t("agent")}
              </th>
              <th className="w-[22%] px-4 py-4 font-medium" scope="col">
                {t("identifier")}
              </th>
              <th className="w-[18%] px-4 py-4 font-medium" scope="col">
                {t("lastCheck")}
              </th>
              <th className="w-12 px-2 py-4" scope="col">
                <span className="sr-only">{t("actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {channels.map((channel, index) => (
              <tr
                key={channel.id}
                className={cn(
                  "h-[84px] transition-colors hover:bg-subtle/50",
                  index < channels.length - 1 && "border-b border-line",
                )}
              >
                <td className="px-5 py-3">
                  <ChannelIdentity
                    channel={channel}
                    onOpen={() => onAction("open", channel)}
                  />
                </td>
                <td className="px-4 py-3">
                  <ChannelStatusBadge status={channel.status} />
                </td>
                <td className="px-4 py-3 text-sm">
                  {channel.agent ? (
                    <span className="font-medium text-ink">
                      {channel.agent}
                    </span>
                  ) : (
                    <span className="text-warning-ink">{t("noAgent")}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-muted-strong">
                  {channel.identifier}
                </td>
                <td className="px-4 py-3 text-sm text-muted-strong">
                  {channel.lastCheck}
                </td>
                <td className="px-2 py-3">
                  <ChannelActions channel={channel} onAction={onAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
