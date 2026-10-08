import { useTranslation } from "react-i18next";

import { Badge } from "@/shared/ui/badge";

import type { ChannelOption } from "../channel-options";

export function ChannelHeading({
  channel,
  active,
}: {
  channel: ChannelOption;
  active?: boolean;
}) {
  const { t } = useTranslation("channelConnect");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <img alt="" height="30" src={channel.icon} width="30" />
      <h1 className="text-xl font-bold sm:text-2xl">{t(channel.label)}</h1>
      {active && <Badge tone="success">{t("active")}</Badge>}
    </div>
  );
}
