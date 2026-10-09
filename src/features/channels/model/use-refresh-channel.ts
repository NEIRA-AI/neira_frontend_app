import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { refreshChannel } from "../api/channels-api";
import { invalidateChannelCache, updateChannelCache } from "./channel-cache";
import { channelErrorCode, channelFailureKey } from "./channel-error";
import type { ChannelNoticeSink } from "./channel-notice";

export function useRefreshChannel(
  workspaceId: string,
  notify: ChannelNoticeSink,
) {
  const { t } = useTranslation("channels");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refreshChannel,
    onMutate: () => notify({ kind: "loading", message: t("refreshing") }),
    onSuccess: (channel) => {
      updateChannelCache(queryClient, workspaceId, channel);
      notify({ kind: "success", message: t("refreshSuccess") });
    },
    onError: async (error, id) => {
      await invalidateChannelCache(queryClient, workspaceId, id);
      notify({
        kind: "error",
        message: t(
          channelFailureKey(channelErrorCode(error)) ?? "refreshFailed",
        ),
      });
    },
  });
}
