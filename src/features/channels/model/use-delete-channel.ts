import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  channelQueryKey,
  channelsQueryKey,
  deleteChannel,
  type ChannelRead,
} from "../api/channels-api";
import { channelErrorCode, channelFailureKey } from "./channel-error";
import type { ChannelNoticeSink } from "./channel-notice";

export function useDeleteChannel(
  workspaceId: string,
  notify: ChannelNoticeSink,
  onDeleted?: () => void,
) {
  const { t } = useTranslation("channels");
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChannel,
    onMutate: () => notify({ kind: "loading", message: t("delete") }),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({
        queryKey: channelQueryKey(workspaceId, id),
      });
      queryClient.setQueryData<ChannelRead[]>(
        channelsQueryKey(workspaceId),
        (channels) => channels?.filter((channel) => channel.id !== id),
      );
      void queryClient.invalidateQueries({
        queryKey: channelsQueryKey(workspaceId),
      });
      notify({ kind: "success", message: t("deleteSuccess") });
      onDeleted?.();
    },
    onError: (error) =>
      notify({
        kind: "error",
        message: t(
          channelFailureKey(channelErrorCode(error)) ?? "deleteFailed",
        ),
      }),
  });
}
