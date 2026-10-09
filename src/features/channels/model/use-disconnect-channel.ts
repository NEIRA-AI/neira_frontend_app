import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { disconnectChannel } from "../api/channels-api";
import { updateChannelCache } from "./channel-cache";
import { channelErrorCode, channelFailureKey } from "./channel-error";
import type { ChannelNoticeSink } from "./channel-notice";

export function useDisconnectChannel(
  workspaceId: string,
  notify: ChannelNoticeSink,
  onDisconnected?: () => void,
) {
  const { t } = useTranslation("channels");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectChannel,
    onMutate: () => notify({ kind: "loading", message: t("disconnect") }),
    onSuccess: (channel) => {
      updateChannelCache(queryClient, workspaceId, channel);
      const issue = channelFailureKey(channel.last_error_code);
      notify({
        kind: issue ? "error" : "success",
        message: t(issue ?? "disconnectSuccess"),
      });
      onDisconnected?.();
    },
    onError: (error) =>
      notify({
        kind: "error",
        message: t(
          channelFailureKey(channelErrorCode(error)) ?? "disconnectFailed",
        ),
      }),
  });
}
