import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { ROUTES, channelDetailsPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

import type { ChannelPreview } from "./model/channel-preview";
import { useChannelsPreview } from "./model/channels-preview-context";
import { ChannelDialog, type ChannelDialogMode } from "./ui/channel-dialog";
import { ChannelsEmpty, ChannelsNoResults } from "./ui/channels-empty";
import { ChannelsList, type ChannelAction } from "./ui/channels-list";

type DialogState = { mode: ChannelDialogMode; channel: ChannelPreview } | null;
type AgentFilter = "all" | "assigned" | "unassigned";

function ChannelsPage() {
  const { t } = useTranslation("channels");
  const navigate = useNavigate();
  const { channels, setChannels } = useChannelsPreview();
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState<AgentFilter>("all");
  const [dialog, setDialog] = useState<DialogState>(null);

  const query = search.trim().toLocaleLowerCase();
  const filteredChannels = channels.filter((channel) => {
    const matchesAgent =
      agentFilter === "all" ||
      (agentFilter === "assigned"
        ? channel.agent !== null
        : channel.agent === null);
    const searchText =
      `${channel.platform} ${channel.name} ${channel.identifier} ${channel.agent ?? ""}`.toLocaleLowerCase();
    return matchesAgent && (!query || searchText.includes(query));
  });

  function handleAction(action: ChannelAction, channel: ChannelPreview) {
    const detailsPath = channelDetailsPath(channel.id);
    switch (action) {
      case "open":
        navigate(detailsPath);
        break;
      case "edit":
      case "delete":
        setDialog({ mode: action, channel });
        break;
      case "check":
      case "changeAgent":
        navigate(
          `${detailsPath}#${action === "check" ? "connection" : "agent"}`,
        );
        break;
      case "reconnect":
        navigate(
          `${ROUTES.CHANNELS_CONNECT}?channel=${encodeURIComponent(channel.platform)}`,
        );
        break;
      case "toggle":
        if (channel.status === "active") {
          setDialog({ mode: "turnOff", channel });
        } else {
          setChannels((current) =>
            current.map((item) =>
              item.id === channel.id ? { ...item, status: "active" } : item,
            ),
          );
        }
        break;
    }
  }

  function confirmDialog(name?: string, identifier?: string) {
    if (!dialog) return;
    const { channel, mode } = dialog;
    setChannels((current) => {
      if (mode === "delete") {
        return current.filter((item) => item.id !== channel.id);
      }
      return current.map((item) => {
        if (item.id !== channel.id) return item;
        if (mode === "turnOff") return { ...item, status: "stopped" };
        return {
          ...item,
          name: name ?? item.name,
          identifier: identifier ?? item.identifier,
        };
      });
    });
    setDialog(null);
  }

  return (
    <div className="min-h-full bg-page">
      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <div className="mx-auto flex min-h-20 w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="flex items-baseline gap-2 text-2xl font-bold text-ink">
            {t("title")}
            <span className="text-base font-normal text-muted">
              {channels.length}
            </span>
          </h1>
          <Button asChild className="max-sm:w-full">
            <Link to={ROUTES.CHANNELS_CONNECT}>
              <Plus aria-hidden="true" className="size-4" />
              {t("connect")}
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8">
        <p className="mb-5 rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-5 text-muted">
          {t("previewNotice")}
        </p>
        {channels.length === 0 ? (
          <ChannelsEmpty />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Select
                ariaLabel={t("allAgents")}
                className="w-full sm:w-44"
                onValueChange={(value) => {
                  if (
                    value === "all" ||
                    value === "assigned" ||
                    value === "unassigned"
                  ) {
                    setAgentFilter(value);
                  }
                }}
                options={[
                  { value: "all", label: t("allAgents") },
                  { value: "assigned", label: t("assignedAgents") },
                  { value: "unassigned", label: t("noAgent") },
                ]}
                value={agentFilter}
              />
              <div className="relative w-full sm:w-64">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                />
                <Input
                  aria-label={t("search")}
                  className="min-h-10 pl-10"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("search")}
                  type="search"
                  value={search}
                />
              </div>
            </div>
            {filteredChannels.length ? (
              <ChannelsList
                channels={filteredChannels}
                onAction={handleAction}
              />
            ) : (
              <ChannelsNoResults />
            )}
          </div>
        )}
      </div>

      {dialog && (
        <ChannelDialog
          channel={dialog.channel}
          key={`${dialog.mode}:${dialog.channel.id}`}
          mode={dialog.mode}
          onClose={() => setDialog(null)}
          onConfirm={confirmDialog}
        />
      )}
    </div>
  );
}

export const Component = ChannelsPage;
