import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/shared/ui/input";

import type { ChannelRead } from "../api/channels-api";
import { ChannelsList, type ChannelAction } from "./channels-list";

export function ChannelsCatalog({
  channels,
  funnels,
  canManage,
  onAction,
}: {
  channels: ChannelRead[];
  funnels: ReadonlyArray<{ id: string; name: string }>;
  canManage: boolean;
  onAction: (action: ChannelAction, channel: ChannelRead) => void;
}) {
  const { t } = useTranslation("channels");
  const [search, setSearch] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const filteredChannels = channels.filter((channel) =>
    `${channel.name} ${channel.external_id} ${channel.provider}`
      .toLocaleLowerCase()
      .includes(query),
  );
  const funnelNames = new Map(
    funnels.map((funnel) => [funnel.id, funnel.name]),
  );

  return (
    <div className="space-y-4">
      <div className="relative ml-auto w-full sm:w-80">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        />
        <Input
          aria-label={t("search")}
          className="pl-10"
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("search")}
          type="search"
          value={search}
        />
      </div>
      {filteredChannels.length ? (
        <ChannelsList
          canManage={canManage}
          channels={filteredChannels}
          funnelNames={funnelNames}
          onAction={onAction}
        />
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl bg-surface px-5 text-center">
          <Search aria-hidden="true" className="size-8 text-muted" />
          <h2 className="mt-4 text-lg font-semibold text-ink">
            {t("noResults")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("noResultsDescription")}</p>
        </div>
      )}
    </div>
  );
}
