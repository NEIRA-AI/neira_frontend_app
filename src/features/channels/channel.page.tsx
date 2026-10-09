import { Pause, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";

import { useAuth } from "@/features/auth";
import { useListFunnels } from "@/features/funnels";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import { providerDetails } from "./model/channel-presentation";
import { useChannel } from "./model/use-channel";
import { useCheckChannel } from "./model/use-check-channel";
import { useChannelNotice } from "./model/use-channel-notice";
import { useDeleteChannel } from "./model/use-delete-channel";
import { useDisconnectChannel } from "./model/use-disconnect-channel";
import { useRefreshChannel } from "./model/use-refresh-channel";
import { useReconnectChannel } from "./model/use-connect-channel";
import { useUpdateChannel } from "./model/use-update-channel";
import { ChannelActionDialog } from "./ui/channel-action-dialog";
import { ChannelConnectionCard } from "./ui/channel-connection-card";
import { ChannelInfoCard } from "./ui/channel-info-card";
import { ChannelNoticeToast } from "./ui/channel-notice";
import { ChannelStatusBadge } from "./ui/channel-presentation";
import { ChannelSettingsForm } from "./ui/channel-settings-form";
import { ConnectGuideDrawer } from "./ui/connect-guide-drawer";
import { ReconnectChannelDialog } from "./ui/reconnect-channel-dialog";

function ChannelPage() {
  const { t } = useTranslation("channels");
  const { channelId } = useParams<"channelId">();
  const navigate = useNavigate();
  const { workspaceId, workspaces } = useAuth();
  const workspace = workspaceId ?? "";
  const role = workspaces.find((item) => item.id === workspaceId)?.role;
  const canManage = role === "owner" || role === "admin";
  const { notice, notify, dismiss } = useChannelNotice("connectSuccess");
  const [dialog, setDialog] = useState<"disconnect" | "delete" | null>(null);
  const [reconnectOpen, setReconnectOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const channelQuery = useChannel(workspace, channelId ?? "");
  const funnelsQuery = useListFunnels(workspace);
  const update = useUpdateChannel(workspace, notify);
  const check = useCheckChannel(workspace, notify);
  const refresh = useRefreshChannel(workspace, notify);
  const reconnect = useReconnectChannel(workspace, notify, () =>
    setReconnectOpen(false),
  );
  const disconnect = useDisconnectChannel(workspace, notify, () =>
    setDialog(null),
  );
  const remove = useDeleteChannel(workspace, notify, () =>
    navigate(ROUTES.CHANNELS, { state: { channelNotice: "deleteSuccess" } }),
  );
  const channel = channelQuery.data;
  const busy =
    update.isPending ||
    check.isPending ||
    refresh.isPending ||
    reconnect.isPending ||
    disconnect.isPending ||
    remove.isPending;

  function confirmAction() {
    if (!channel || !dialog || !canManage) return;
    if (dialog === "delete") remove.mutate(channel.id);
    else disconnect.mutate(channel.id);
  }

  if (channelQuery.isPending) {
    return (
      <p className="px-6 py-12 text-sm text-muted" role="status">
        {t("loading")}
      </p>
    );
  }
  if (!channelId || channelQuery.isError || !channel) {
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
  const provider = providerDetails(channel.provider);

  return (
    <div className="min-h-full bg-page text-ink">
      <ChannelNoticeToast notice={notice} onDismiss={dismiss} />
      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <nav
          aria-label={t("breadcrumb")}
          className="mx-auto flex h-20 w-full max-w-[900px] items-center gap-2 px-4 text-sm sm:px-6"
        >
          <Link
            className="text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
            to={ROUTES.CHANNELS}
          >
            {t("breadcrumb")}
          </Link>
          <span aria-hidden="true" className="text-muted">
            /
          </span>
          <span className="truncate">{channel.name}</span>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-[900px] space-y-4 px-4 pb-12 pt-8 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <img alt="" className="size-7 object-contain" src={provider.icon} />
            <h1 className="min-w-0 truncate text-2xl font-bold">
              {channel.name}
            </h1>
            <ChannelStatusBadge status={channel.status} />
          </div>
          {canManage && (
            <div className="flex flex-wrap gap-2">
              {channel.status === "active" && (
                <Button
                  onClick={() => setDialog("disconnect")}
                  size="sm"
                  variant="outline"
                >
                  <Pause aria-hidden="true" className="size-4" />
                  {t("disconnect")}
                </Button>
              )}
              <Button
                onClick={() => setDialog("delete")}
                size="sm"
                variant="ghost"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                {t("delete")}
              </Button>
            </div>
          )}
        </div>
        <ChannelInfoCard channel={channel} />
        <ChannelConnectionCard
          busy={busy}
          canManage={canManage}
          channel={channel}
          onCheck={() => check.mutate(channel.id)}
          onReconnect={() => {
            reconnect.clearError();
            setReconnectOpen(true);
          }}
          onRefresh={() => refresh.mutate(channel.id)}
        />
        <ChannelSettingsForm
          busy={busy}
          canManage={canManage}
          channel={channel}
          funnels={funnelsQuery.data ?? []}
          key={channel.id}
          onSave={(name, funnelId) =>
            update.mutate({ id: channel.id, name, funnel_id: funnelId })
          }
        />
      </main>
      {dialog && (
        <ChannelActionDialog
          action={dialog}
          busy={busy}
          channel={channel}
          onClose={() => setDialog(null)}
          onConfirm={confirmAction}
        />
      )}
      {reconnectOpen && (
        <ReconnectChannelDialog
          busy={reconnect.isPending}
          channel={channel}
          error={reconnect.errorMessage}
          onClose={() => setReconnectOpen(false)}
          onGuideOpen={() => setGuideOpen(true)}
          onSubmit={(token) => reconnect.mutate({ id: channel.id, token })}
        />
      )}
      <ConnectGuideDrawer
        onOpenChange={setGuideOpen}
        open={guideOpen}
        provider={channel.provider}
      />
    </div>
  );
}

export const Component = ChannelPage;
