import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { conversationsQueryKey, sendMessage } from "../api/conversations-api";

export function sendFailureKind(
  error: unknown,
):
  | "failed"
  | "uncertain"
  | "forbidden"
  | "unavailable"
  | "connection"
  | "conflict"
  | "general" {
  if (!axios.isAxiosError(error)) return "uncertain";
  if (!error.response) return "uncertain";
  if (error.response?.status === 403) return "forbidden";
  if (error.response?.status === 404) return "unavailable";
  const body: unknown = error.response?.data;
  if (!body || typeof body !== "object") return "general";
  const detail = (body as Record<string, unknown>).detail;
  if (!detail || typeof detail !== "object") return "general";
  const code = (detail as Record<string, unknown>).code;
  if (
    code === "connection_unavailable" ||
    code === "channel_credentials_unavailable"
  )
    return "connection";
  const status = (detail as Record<string, unknown>).delivery_status;
  if (status === "failed") return "failed";
  if (status === "unknown" || status === "pending") return "uncertain";
  if (code === "unsupported_conversation") return "unavailable";
  if (code === "client_message_conflict") return "conflict";
  return "general";
}

export function useSendMessage(workspaceId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      text,
      clientMessageId,
    }: {
      text: string;
      clientMessageId: string;
    }) =>
      sendMessage(conversationId, {
        text,
        client_message_id: clientMessageId,
      }),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: conversationsQueryKey(workspaceId),
      }),
  });
}
