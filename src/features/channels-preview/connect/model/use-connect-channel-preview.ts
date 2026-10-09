import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";

import { ROUTES } from "@/shared/config/routes";

import { channelAliases, channelOptions } from "../channel-options";
import type { SetupDraft } from "../setup-draft";
import type { WizardStep } from "../ui/progress-card";

export function useConnectChannelPreview() {
  const { t } = useTranslation("channelConnectPreview");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorPreview = searchParams.get("preview") === "error";
  const requestedChannel = searchParams.get("channel");
  const channelFromQuery = requestedChannel
    ? (channelAliases[requestedChannel] ?? requestedChannel)
    : null;
  const preselectedChannel = channelOptions.some(
    (channel) => channel.id === channelFromQuery,
  )
    ? channelFromQuery
    : null;
  const [step, setStep] = useState<WizardStep>(errorPreview ? 2 : 1);
  const [selected, setSelected] = useState<string | null>(
    errorPreview ? "telegram-premium" : preselectedChannel,
  );
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<SetupDraft>({
    channelName: t(
      errorPreview ? "sampleErrorChannelName" : "sampleChannelName",
    ),
    phone: "",
    phoneError: false,
    codePreview: false,
    telegramCode: "",
  });
  const [errorVisible, setErrorVisible] = useState(errorPreview);
  const [agentId, setAgentId] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const actionTimer = useRef<number | null>(null);
  const selectedChannel = channelOptions.find(
    (channel) => channel.id === selected,
  );

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(
    () => () => {
      if (actionTimer.current !== null)
        window.clearTimeout(actionTimer.current);
    },
    [],
  );

  function updateDraft(patch: Partial<SetupDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function goBack() {
    if (actionTimer.current !== null) {
      window.clearTimeout(actionTimer.current);
      actionTimer.current = null;
    }
    setChecking(false);
    setFinishing(false);
    setErrorVisible(false);
    setNotice(null);
    if (step === 1) navigate(ROUTES.CHANNELS_PREVIEW);
    else setStep(step === 3 ? 2 : 1);
  }

  function checkPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.channelName.trim() || checking) return;
    if (selected === "telegram-personal" && !draft.codePreview) {
      const digitCount = draft.phone.replace(/\D/g, "").length;
      if (digitCount < 10 || digitCount > 15) {
        updateDraft({ phoneError: true });
        return;
      }
      updateDraft({ codePreview: true });
      setNotice(t("codeNotSentPreview"));
      return;
    }
    if (selected === "telegram-personal" && draft.telegramCode.length !== 5)
      return;
    setErrorVisible(false);
    setChecking(true);
    setNotice(
      t(
        selected === "instagram"
          ? "instagramWaiting"
          : selected === "facebook"
            ? "facebookWaiting"
            : "previewConnecting",
      ),
    );
    actionTimer.current = window.setTimeout(() => {
      actionTimer.current = null;
      setChecking(false);
      setStep(3);
      setNotice(t("previewConnectionSuccess"));
    }, 750);
  }

  async function copyText(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(successMessage);
    } catch {
      setNotice(t("copyError"));
    }
  }

  function finishPreview() {
    if (!agentId || finishing) return;
    setFinishing(true);
    setNotice(t("previewAgentSuccess"));
    actionTimer.current = window.setTimeout(() => {
      actionTimer.current = null;
      navigate(ROUTES.CHANNELS_PREVIEW);
    }, 1500);
  }

  return {
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
  };
}
