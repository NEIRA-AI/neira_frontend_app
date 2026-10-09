import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { checkChannel } from "../api/channels-api";
import { invalidateChannelCache, updateChannelCache } from "./channel-cache";
import { channelErrorCode, channelFailureKey } from "./channel-error";
import type { ChannelNoticeSink } from "./channel-notice";

export function useCheckChannel(
  workspaceId: string,
  notify: ChannelNoticeSink,
) {
  const { t } = useTranslation("channels");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkChannel,
    onMutate: () =>
      notify({ kind: "loading", message: t("checkingConnection") }),
    onSuccess: (channel) => {
      updateChannelCache(queryClient, workspaceId, channel);
      notify({
        kind: channel.status === "active" ? "success" : "error",
        message: t(
          channel.status === "active"
            ? "checkSuccess"
            : (channelFailureKey(channel.last_error_code) ?? "checkFailed"),
        ),
      });
    },
    onError: async (error, id) => {
      await invalidateChannelCache(queryClient, workspaceId, id);
      notify({
        kind: "error",
        message: t(channelFailureKey(channelErrorCode(error)) ?? "checkFailed"),
      });
    },
  });
}
