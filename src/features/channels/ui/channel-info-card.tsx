import { useTranslation } from "react-i18next";

import { Card } from "@/shared/ui/card";

import type { ChannelRead } from "../api/channels-api";
import {
  channelProfileField,
  providerDetails,
} from "../model/channel-presentation";

export function ChannelInfoCard({ channel }: { channel: ChannelRead }) {
  const { t } = useTranslation("channels");
  const provider = providerDetails(channel.provider);
  const avatarUrl = channelProfileField(channel.profile, "avatar_url");
  const providerName = channelProfileField(channel.profile, "name");
  const username = channelProfileField(channel.profile, "username");

  return (
    <Card className="border-0 p-4 sm:p-6">
      <h2 className="text-base font-semibold">{t("channelInfo")}</h2>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        {avatarUrl ? (
          <img
            alt=""
            className="size-16 rounded-full object-cover"
            height="64"
            src={avatarUrl}
            width="64"
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-full bg-subtle">
            <img alt="" className="size-8 object-contain" src={provider.icon} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs text-muted">{t("providerName")}</p>
          <p className="truncate text-base font-semibold text-ink">
            {providerName || channel.name}
          </p>
          {username && <p className="mt-1 text-sm text-muted">{username}</p>}
        </div>
      </div>
      <dl className="mt-5 grid gap-3 border-t border-line pt-5 text-sm sm:grid-cols-[160px_minmax(0,1fr)]">
        <dt className="text-muted">{t("externalId")}</dt>
        <dd className="min-w-0 break-all font-mono text-ink">
          {channel.external_id}
        </dd>
      </dl>
    </Card>
  );
}
