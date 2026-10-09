import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { channelDetailsPath } from "@/shared/config/routes";

import type {
  ChannelProvider,
  ValidateChannelInput,
  ValidatedChannel,
} from "../api/channels-api";
import type { ChannelNotice } from "./channel-notice";
import { channelErrorCode, channelFailureKey } from "./channel-error";
import { useConnectChannel } from "./use-connect-channel";
import { useValidateChannel } from "./use-validate-channel";

export type ConnectStep = 1 | 2 | 3;
export type SetupError =
  | "requiredName"
  | "requiredToken"
  | "invalidGroupId"
  | "invalidVkCommunity"
  | "invalidToken"
  | "missingPermissions"
  | "validationFailed"
  | null;

export function useConnectChannelFlow(
  workspaceId: string,
  onNotice: (notice: ChannelNotice) => void,
) {
  const { t } = useTranslation("channels");
  const navigate = useNavigate();
  const validate = useValidateChannel();
  const connect = useConnectChannel(workspaceId);
  const [step, setStep] = useState<ConnectStep>(1);
  const [provider, setProvider] = useState<ChannelProvider | null>(null);
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [groupId, setGroupId] = useState("");
  const [funnelId, setFunnelId] = useState<string | null>(null);
  const [verified, setVerified] = useState<ValidatedChannel | null>(null);
  const [error, setError] = useState<SetupError>(null);

  function chooseProvider(next: ChannelProvider) {
    setProvider(next);
    setName("");
    setToken("");
    setGroupId("");
    setFunnelId(null);
    setVerified(null);
    setError(null);
  }

  function changeToken(next: string) {
    setToken(next);
    setVerified(null);
    setError(null);
  }

  function changeGroupId(next: string) {
    setGroupId(next);
    setVerified(null);
    setError(null);
  }

  function back() {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  }

  function credentialInput(): ValidateChannelInput | null {
    if (!provider) return null;
    if (provider === "telegram_bot") {
      return { provider, token: token.trim() };
    }
    const group_id = Number(groupId.trim());
    if (!Number.isSafeInteger(group_id) || group_id <= 0) return null;
    return { provider, token: token.trim(), group_id };
  }

  async function checkCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("requiredName");
      return;
    }
    if (!token.trim()) {
      setError("requiredToken");
      return;
    }
    const input = credentialInput();
    if (!input) {
      setError(
        provider === "vk_community" ? "invalidGroupId" : "validationFailed",
      );
      return;
    }
    setError(null);
    onNotice({ kind: "loading", message: t("checkingConnection") });
    try {
      const result = await validate.mutateAsync(input);
      setVerified(result);
      setStep(3);
      onNotice({ kind: "success", message: t("validated") });
    } catch (requestError) {
      const code = channelErrorCode(requestError);
      const nextError: SetupError =
        code === "invalid_token"
          ? "invalidToken"
          : code === "missing_permissions"
            ? "missingPermissions"
            : code === "invalid_group"
              ? "invalidVkCommunity"
              : "validationFailed";
      setError(nextError);
      onNotice({
        kind: "error",
        message: t(channelFailureKey(code) ?? nextError),
      });
    }
  }

  async function finish() {
    const input = credentialInput();
    if (!verified || !input || connect.isPending) return;
    onNotice({ kind: "loading", message: t("connecting") });
    try {
      const saved = await connect.mutateAsync({
        ...input,
        name: name.trim(),
        funnel_id: funnelId,
      });
      navigate(channelDetailsPath(saved.id), {
        state: { channelNotice: "connectSuccess" },
      });
    } catch (requestError) {
      const code = channelErrorCode(requestError);
      onNotice({
        kind: "error",
        message: t(channelFailureKey(code) ?? "connectFailed"),
      });
    }
  }

  return {
    step,
    provider,
    name,
    token,
    groupId,
    funnelId,
    verified,
    error,
    checking: validate.isPending,
    connecting: connect.isPending,
    chooseProvider,
    setName,
    changeToken,
    changeGroupId,
    setFunnelId,
    next: () => provider && setStep(2),
    back,
    checkCredentials,
    finish,
  };
}
