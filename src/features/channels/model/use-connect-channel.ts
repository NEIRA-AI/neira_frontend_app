import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  channelsQueryKey,
  connectChannel,
  reconnectChannel,
} from "../api/channels-api";
import { invalidateChannelCache, updateChannelCache } from "./channel-cache";
import { channelErrorCode, channelFailureKey } from "./channel-error";
import type { ChannelNoticeSink } from "./channel-notice";

export function useConnectChannel(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectChannel,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: channelsQueryKey(workspaceId),
      }),
    onError: () =>
      queryClient.invalidateQueries({
        queryKey: channelsQueryKey(workspaceId),
      }),
  });
}

export function useReconnectChannel(
  workspaceId: string,
  notify: ChannelNoticeSink,
  onConnected: () => void,
) {
  const { t } = useTranslation("channels");
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: reconnectChannel,
    onMutate: () => {
      setErrorMessage(null);
      notify({ kind: "loading", message: t("reconnecting") });
    },
    onSuccess: (channel) => {
      updateChannelCache(queryClient, workspaceId, channel);
      onConnected();
      notify({
        kind: channel.status === "active" ? "success" : "error",
        message: t(
          channel.status === "active"
            ? "connectSuccess"
            : (channelFailureKey(channel.last_error_code) ?? "checkFailed"),
        ),
      });
    },
    onError: async (error, input) => {
      await invalidateChannelCache(queryClient, workspaceId, input.id);
      const message = t(
        channelFailureKey(channelErrorCode(error)) ?? "connectFailed",
      );
      setErrorMessage(message);
      notify({ kind: "error", message });
    },
  });
  return { ...mutation, errorMessage, clearError: () => setErrorMessage(null) };
}
