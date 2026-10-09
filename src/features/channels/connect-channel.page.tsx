import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { useAuth } from "@/features/auth";
import { FunnelEditorDialog, useListFunnels } from "@/features/funnels";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import { useChannelNotice } from "./model/use-channel-notice";
import { useConnectChannelFlow } from "./model/use-connect-channel-flow";
import { ChannelNoticeToast } from "./ui/channel-notice";
import { ChooseProviderStep } from "./ui/choose-provider-step";
import { ConnectFunnelStep } from "./ui/connect-funnel-step";
import { ConnectGuideDrawer } from "./ui/connect-guide-drawer";
import { ConnectProgress } from "./ui/connect-progress";
import { SetupChannelStep } from "./ui/setup-channel-step";

function ConnectChannelPage() {
  const { t } = useTranslation("channels");
  const navigate = useNavigate();
  const { workspaceId, workspaces } = useAuth();
  const workspace = workspaceId ?? "";
  const role = workspaces.find((item) => item.id === workspaceId)?.role;
  const canManage = role === "owner" || role === "admin";
  const funnelsQuery = useListFunnels(workspace);
  const { notice, notify, dismiss } = useChannelNotice();
  const [guideOpen, setGuideOpen] = useState(false);
  const [createFunnelOpen, setCreateFunnelOpen] = useState(false);
  const flow = useConnectChannelFlow(workspace, notify);

  function back() {
    if (flow.step === 1) navigate(ROUTES.CHANNELS);
    else flow.back();
  }

  return (
    <div className="min-h-full bg-page text-ink">
      <ChannelNoticeToast notice={notice} onDismiss={dismiss} />
      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <nav
          aria-label={t("connectTitle")}
          className="mx-auto flex h-20 w-full max-w-[1080px] items-center gap-2 px-4 text-sm sm:px-6 lg:px-8"
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
          <span aria-current="page">{t("connectTitle")}</span>
        </nav>
      </header>
      {!canManage ? (
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="text-xl font-semibold">{t("unavailable")}</h1>
          <Button asChild className="mt-6">
            <Link to={ROUTES.CHANNELS}>{t("backToChannels")}</Link>
          </Button>
        </div>
      ) : (
        <main className="mx-auto grid w-full max-w-[1080px] gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8 xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-8">
          <aside>
            <button
              className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand"
              onClick={back}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              {t("back")}
            </button>
            <ConnectProgress step={flow.step} />
          </aside>
          <section className="min-w-0">
            {flow.step === 1 && (
              <ChooseProviderStep
                onContinue={flow.next}
                onSelect={flow.chooseProvider}
                selected={flow.provider}
              />
            )}
            {flow.step === 2 && flow.provider && (
              <SetupChannelStep
                checking={flow.checking}
                error={flow.error}
                groupId={flow.groupId}
                name={flow.name}
                onBack={back}
                onGroupIdChange={flow.changeGroupId}
                onGuideOpen={() => setGuideOpen(true)}
                onNameChange={flow.setName}
                onSubmit={(event) => void flow.checkCredentials(event)}
                onTokenChange={flow.changeToken}
                provider={flow.provider}
                token={flow.token}
              />
            )}
            {flow.step === 3 && flow.provider && flow.verified && (
              <ConnectFunnelStep
                canCreateFunnel={role === "owner"}
                connecting={flow.connecting}
                funnelId={flow.funnelId}
                funnels={funnelsQuery.data ?? []}
                funnelsError={funnelsQuery.isError}
                loadingFunnels={funnelsQuery.isPending}
                onBack={back}
                onCreateFunnel={() => setCreateFunnelOpen(true)}
                onFinish={() => void flow.finish()}
                onFunnelChange={flow.setFunnelId}
                onRetryFunnels={() => void funnelsQuery.refetch()}
                provider={flow.provider}
                verified={flow.verified}
              />
            )}
          </section>
        </main>
      )}
      {flow.provider && (
        <ConnectGuideDrawer
          onOpenChange={setGuideOpen}
          open={guideOpen}
          provider={flow.provider}
        />
      )}
      {workspaceId && createFunnelOpen && (
        <FunnelEditorDialog
          onClose={() => setCreateFunnelOpen(false)}
          onSaved={(id) => {
            flow.setFunnelId(id);
            setCreateFunnelOpen(false);
          }}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
}

export const Component = ConnectChannelPage;
