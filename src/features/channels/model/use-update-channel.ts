import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { updateChannel } from "../api/channels-api";
import { updateChannelCache } from "./channel-cache";
import { channelErrorCode, channelFailureKey } from "./channel-error";
import type { ChannelNoticeSink } from "./channel-notice";

export function useUpdateChannel(
  workspaceId: string,
  notify: ChannelNoticeSink,
) {
  const { t } = useTranslation("channels");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateChannel,
    onMutate: () => notify({ kind: "loading", message: t("saving") }),
    onSuccess: (channel) => {
      updateChannelCache(queryClient, workspaceId, channel);
      notify({ kind: "success", message: t("saveSuccess") });
    },
    onError: (error) =>
      notify({
        kind: "error",
        message: t(channelFailureKey(channelErrorCode(error)) ?? "saveFailed"),
      }),
  });
}
