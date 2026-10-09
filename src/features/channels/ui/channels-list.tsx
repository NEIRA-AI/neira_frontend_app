import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  MoreVertical,
  Pause,
  RefreshCw,
  RotateCcw,
  Settings2,
  Trash2,
  Wifi,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { channelDetailsPath } from "@/shared/config/routes";

import type { ChannelRead } from "../api/channels-api";
import {
  formatCheckTime,
  providerDetails,
} from "../model/channel-presentation";
import { ChannelStatusBadge } from "./channel-presentation";

export type ChannelAction =
  "check" | "refresh" | "reconnect" | "disconnect" | "delete";

function ChannelMenu({
  channel,
  onAction,
}: {
  channel: ChannelRead;
  onAction: (action: ChannelAction, channel: ChannelRead) => void;
}) {
  const { t } = useTranslation("channels");
  const actions: ReadonlyArray<{
    id: ChannelAction;
    label: string;
    icon: typeof Wifi;
  }> = [
    ...(channel.status === "active" || channel.status === "pending"
      ? [
          { id: "check" as const, label: t("check"), icon: Wifi },
          { id: "refresh" as const, label: t("refresh"), icon: RotateCcw },
        ]
      : []),
    { id: "reconnect", label: t("reconnect"), icon: RefreshCw },
    ...(channel.status === "active"
      ? [{ id: "disconnect" as const, label: t("disconnect"), icon: Pause }]
      : []),
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={`${t("actions")}: ${channel.name}`}
          className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
          type="button"
        >
          <MoreVertical aria-hidden="true" className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 min-w-52 rounded-xl border border-line bg-surface p-1 text-sm text-ink shadow-xl"
          sideOffset={6}
        >
          <DropdownMenu.Item asChild>
            <Link
              className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 outline-none data-highlighted:bg-brand-soft"
              to={channelDetailsPath(channel.id)}
            >
              <Settings2 aria-hidden="true" className="size-4" />
              {t("settings")}
            </Link>
          </DropdownMenu.Item>
          {actions.map(({ id, label, icon: Icon }) => (
            <DropdownMenu.Item
              className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 outline-none data-highlighted:bg-brand-soft data-highlighted:text-brand-strong"
              key={id}
              onSelect={() => onAction(id, channel)}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item
            className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-danger outline-none data-highlighted:bg-danger-soft"
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

function ChannelIdentity({ channel }: { channel: ChannelRead }) {
  const { t } = useTranslation("channels");
  const provider = providerDetails(channel.provider);
  return (
    <Link
      className="flex min-w-0 items-center gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-brand"
      to={channelDetailsPath(channel.id)}
    >
      <img
        alt=""
        className="size-8 shrink-0 object-contain"
        src={provider.icon}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">
          {channel.name}
        </span>
        <span className="block truncate text-xs text-muted">
          {t(provider.label)}
        </span>
      </span>
    </Link>
  );
}

export function ChannelsList({
  channels,
  funnelNames,
  canManage,
  onAction,
}: {
  channels: ChannelRead[];
  funnelNames: ReadonlyMap<string, string>;
  canManage: boolean;
  onAction: (action: ChannelAction, channel: ChannelRead) => void;
}) {
  const { t, i18n } = useTranslation("channels");

  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {channels.map((channel) => (
          <article className="rounded-2xl bg-surface p-4" key={channel.id}>
            <div className="flex items-start justify-between gap-2">
              <ChannelIdentity channel={channel} />
              {canManage && (
                <ChannelMenu channel={channel} onAction={onAction} />
              )}
            </div>
            <dl className="mt-4 grid grid-cols-[1fr_auto] gap-2 border-t border-line pt-4 text-xs">
              <dt className="text-muted">{t("status")}</dt>
              <dd>
                <ChannelStatusBadge status={channel.status} />
              </dd>
              <dt className="text-muted">{t("funnel")}</dt>
              <dd className="max-w-44 truncate text-right text-ink">
                {channel.funnel_id
                  ? (funnelNames.get(channel.funnel_id) ?? t("notSelected"))
                  : t("notSelected")}
              </dd>
              <dt className="text-muted">{t("lastCheck")}</dt>
              <dd className="text-right text-ink">
                {formatCheckTime(channel.last_checked_at, i18n.language) ??
                  t("neverChecked")}
              </dd>
            </dl>
          </article>
        ))}
      </div>
      <div
        className="hidden overflow-x-auto rounded-2xl bg-surface lg:block"
        role="region"
        tabIndex={0}
        aria-label={t("title")}
      >
        <table className="w-full min-w-[800px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th className="px-5 py-4 font-medium" scope="col">
                {t("channel")}
              </th>
              <th className="px-4 py-4 font-medium" scope="col">
                {t("status")}
              </th>
              <th className="px-4 py-4 font-medium" scope="col">
                {t("funnel")}
              </th>
              <th className="px-4 py-4 font-medium" scope="col">
                {t("identifier")}
              </th>
              <th className="px-4 py-4 font-medium" scope="col">
                {t("lastCheck")}
              </th>
              {canManage && (
                <th className="w-12 px-2 py-4" scope="col">
                  <span className="sr-only">{t("actions")}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {channels.map((channel) => (
              <tr
                className="h-20 border-b border-line last:border-0 hover:bg-subtle/50"
                key={channel.id}
              >
                <td className="px-5 py-3">
                  <ChannelIdentity channel={channel} />
                </td>
                <td className="px-4 py-3">
                  <ChannelStatusBadge status={channel.status} />
                </td>
                <td className="max-w-48 truncate px-4 py-3 text-sm text-ink">
                  {channel.funnel_id
                    ? (funnelNames.get(channel.funnel_id) ?? t("notSelected"))
                    : t("notSelected")}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-strong">
                  {channel.external_id}
                </td>
                <td className="px-4 py-3 text-sm text-muted-strong">
                  {formatCheckTime(channel.last_checked_at, i18n.language) ??
                    t("neverChecked")}
                </td>
                {canManage && (
                  <td className="px-2 py-3">
                    <ChannelMenu channel={channel} onAction={onAction} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
