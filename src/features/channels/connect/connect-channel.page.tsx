import { ChevronLeft, CircleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "@/shared/config/routes";
import { Badge } from "@/shared/ui/badge";

import { useConnectChannelPreview } from "./model/use-connect-channel-preview";
import { ChooseChannelStep } from "./ui/choose-channel-step";
import { ConnectAgentStep } from "./ui/connect-agent-step";
import { ConnectGuideDrawer } from "./ui/connect-guide-drawer";
import { ProgressCard } from "./ui/progress-card";
import { RequestChannelDialog } from "./ui/request-channel-dialog";
import { SetupChannelStep } from "./ui/setup-channel-step";

import "./connect-channel.css";

function ConnectChannelPage() {
  const { t } = useTranslation("channelConnect");
  const {
    step,
    setStep,
    selected,
    setSelected,
    search,
    setSearch,
    draft,
    errorVisible,
    agentId,
    setAgentId,
    guideOpen,
    setGuideOpen,
    requestOpen,
    setRequestOpen,
    checking,
    finishing,
    notice,
    setNotice,
    selectedChannel,
    updateDraft,
    goBack,
    checkPreview,
    copyText,
    finishPreview,
  } = useConnectChannelPreview();

  return (
    <div className="min-h-screen min-h-svh bg-page text-ink">
      {notice && (
        <div
          className="fixed left-1/2 top-20 z-30 w-max max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink shadow-lg lg:top-5"
          role="status"
        >
          {notice}
        </div>
      )}
      {errorVisible && (
        <div
          className="fixed left-1/2 top-20 z-30 flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-2 rounded-xl border border-danger/30 bg-surface px-4 py-3 text-sm font-medium text-danger shadow-lg lg:top-5"
          role="alert"
        >
          <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
          {t("previewConnectionError")}
        </div>
      )}
      <header className="sticky top-16 z-20 border-b border-line bg-page lg:top-0">
        <nav
          aria-label={t("breadcrumbConnect")}
          className="mx-auto flex h-20 w-full max-w-[1080px] items-center gap-2 px-4 text-sm sm:px-6 lg:px-8"
        >
          <Link
            className="text-muted transition-colors hover:text-ink focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand"
            to={ROUTES.CHANNELS}
          >
            {t("breadcrumbChannels")}
          </Link>
          <span aria-hidden="true" className="text-muted">
            /
          </span>
          <span aria-current="page">{t("breadcrumbConnect")}</span>
          <Badge className="ml-auto" tone="neutral">
            {t("previewBadge")}
          </Badge>
        </nav>
      </header>

      <div className="mx-auto grid w-full max-w-[1080px] gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8 xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-8">
        <aside>
          <button
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink focus-visible:rounded focus-visible:outline-2 focus-visible:outline-brand"
            onClick={goBack}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            {t("back")}
          </button>
          <ProgressCard step={step} />
        </aside>

        <section className="min-w-0 space-y-4">
          {step === 1 && (
            <ChooseChannelStep
              onContinue={() => setStep(2)}
              onRequestChannel={() => setRequestOpen(true)}
              onSearchChange={setSearch}
              onSelect={setSelected}
              search={search}
              selected={selected}
            />
          )}
          {step === 2 && selectedChannel && (
            <SetupChannelStep
              channel={selectedChannel}
              checking={checking}
              draft={draft}
              onBack={goBack}
              onCopyText={copyText}
              onDraftChange={updateDraft}
              onGuideOpen={() => setGuideOpen(true)}
              onNotice={setNotice}
              onSubmit={checkPreview}
            />
          )}
          {step === 3 && selectedChannel && (
            <ConnectAgentStep
              agentId={agentId}
              channel={selectedChannel}
              finishing={finishing}
              onAgentChange={setAgentId}
              onBack={goBack}
              onCreateAgent={() => setNotice(t("createAgentUnavailable"))}
              onFinish={finishPreview}
            />
          )}
        </section>
      </div>

      <ConnectGuideDrawer
        channel={
          selected === "telegram-bot" ||
          selected === "telegram-personal" ||
          selected === "max" ||
          selected === "instagram" ||
          selected === "facebook"
            ? selected
            : "telegram-premium"
        }
        onOpenChange={setGuideOpen}
        open={guideOpen}
      />
      <RequestChannelDialog onOpenChange={setRequestOpen} open={requestOpen} />
    </div>
  );
}

export const Component = ConnectChannelPage;
