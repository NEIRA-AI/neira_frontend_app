import { Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { useAuth } from "@/features/auth";
import { useListFunnels } from "@/features/funnels";
import { ROUTES, channelDetailsPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import type { ChannelRead } from "./api/channels-api";
import { useCheckChannel } from "./model/use-check-channel";
import { useChannelNotice } from "./model/use-channel-notice";
import { useDeleteChannel } from "./model/use-delete-channel";
import { useDisconnectChannel } from "./model/use-disconnect-channel";
import { useListChannels } from "./model/use-list-channels";
import { useRefreshChannel } from "./model/use-refresh-channel";
import { ChannelActionDialog } from "./ui/channel-action-dialog";
import { ChannelNoticeToast } from "./ui/channel-notice";
import { ChannelsCatalog } from "./ui/channels-catalog";
import { ChannelsEmpty } from "./ui/channels-empty";
import type { ChannelAction } from "./ui/channels-list";

type DialogState = {
  action: "disconnect" | "delete";
  channel: ChannelRead;
} | null;

function ChannelsPage() {
  const { t } = useTranslation("channels");
  const navigate = useNavigate();
  const { workspaceId, workspaces } = useAuth();
  const currentWorkspace = workspaces.find((item) => item.id === workspaceId);
  const canManage =
    currentWorkspace?.role === "owner" || currentWorkspace?.role === "admin";
  const workspace = workspaceId ?? "";
  const { notice, notify, dismiss } = useChannelNotice("deleteSuccess");
  const [dialog, setDialog] = useState<DialogState>(null);
  const channelsQuery = useListChannels(workspace);
  const funnelsQuery = useListFunnels(workspace);
  const check = useCheckChannel(workspace, notify);
  const refresh = useRefreshChannel(workspace, notify);
  const disconnect = useDisconnectChannel(workspace, notify, () =>
    setDialog(null),
  );
  const remove = useDeleteChannel(workspace, notify, () => setDialog(null));
  const channels = channelsQuery.data ?? [];

  function handleAction(action: ChannelAction, channel: ChannelRead) {
    if (!canManage) return;
    if (action === "reconnect") {
      navigate(`${channelDetailsPath(channel.id)}#connection`);
      return;
    }
    if (action === "disconnect" || action === "delete") {
      setDialog({ action, channel });
      return;
    }
    if (action === "check") check.mutate(channel.id);
    else refresh.mutate(channel.id);
  }

  function confirmAction() {
    if (!dialog || !canManage) return;
    const { action, channel } = dialog;
    if (action === "delete") remove.mutate(channel.id);
    else disconnect.mutate(channel.id);
  }

  return (
    <div className="min-h-full bg-page">
      <ChannelNoticeToast notice={notice} onDismiss={dismiss} />
      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <div className="mx-auto flex min-h-20 w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="flex items-baseline gap-2 text-2xl font-bold text-ink">
            {t("title")}
            {!channelsQuery.isPending && (
              <span className="text-base font-normal text-muted">
                {channels.length}
              </span>
            )}
          </h1>
          {canManage && (
            <Button asChild className="max-sm:w-full">
              <Link to={ROUTES.CHANNELS_CONNECT}>
                <Plus aria-hidden="true" className="size-4" />
                {t("connect")}
              </Link>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8">
        {channelsQuery.isPending ? (
          <p className="py-12 text-sm text-muted" role="status">
            {t("loading")}
          </p>
        ) : channelsQuery.isError ? (
          <div className="rounded-xl bg-surface px-5 py-8" role="alert">
            <p className="text-sm text-danger">{t("loadError")}</p>
            <Button
              className="mt-4"
              onClick={() => void channelsQuery.refetch()}
              variant="outline"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {t("retry")}
            </Button>
          </div>
        ) : channels.length === 0 ? (
          <ChannelsEmpty canManage={canManage} />
        ) : (
          <ChannelsCatalog
            canManage={canManage}
            channels={channels}
            funnels={funnelsQuery.data ?? []}
            onAction={handleAction}
          />
        )}
      </main>

      {dialog && (
        <ChannelActionDialog
          action={dialog.action}
          busy={disconnect.isPending || remove.isPending}
          channel={dialog.channel}
          onClose={() => setDialog(null)}
          onConfirm={confirmAction}
        />
      )}
    </div>
  );
}

export const Component = ChannelsPage;
