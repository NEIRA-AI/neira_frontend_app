import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import {
  conversationsQueryKey,
  sendFile,
  sendMedia,
  sendMessage,
  sendPhoto,
  type MediaAttachment,
} from "../api/conversations-api";

type SendInput =
  | { kind?: "text"; text: string; clientMessageId: string }
  | { kind: "photo"; photo: File; caption: string; clientMessageId: string }
  | { kind: "file"; file: File; caption: string; clientMessageId: string }
  | {
      kind: "media";
      attachments: MediaAttachment[];
      caption: string;
      clientMessageId: string;
    };

function sendErrorDetail(error: unknown): Record<string, unknown> | null {
  if (!axios.isAxiosError(error)) return null;
  const body: unknown = error.response?.data;
  const detail =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).detail
      : null;
  return detail && typeof detail === "object"
    ? (detail as Record<string, unknown>)
    : null;
}

export function persistedSendStatus(
  error: unknown,
  messageId: string,
): "failed" | "unknown" | "pending" | null {
  const detail = sendErrorDetail(error);
  if (detail?.message_id !== messageId) return null;
  const status = detail.delivery_status;
  return status === "failed" || status === "unknown" || status === "pending"
    ? status
    : null;
}

export function sendFailureKind(
  error: unknown,
  attachmentKind?: "photo" | "file" | "media" | "text",
):
  | "failed"
  | "uncertain"
  | "forbidden"
  | "unavailable"
  | "connection"
  | "permissions"
  | "conflict"
  | "photo_invalid"
  | "photo_too_large"
  | "photo_caption_too_long"
  | "photo_storage_unavailable"
  | "file_empty"
  | "file_too_large"
  | "file_caption_too_long"
  | "file_storage_unavailable"
  | "media_storage_unavailable"
  | "general" {
  if (!axios.isAxiosError(error)) return "uncertain";
  if (!error.response) return "uncertain";
  const errorDetail = sendErrorDetail(error);
  const code = errorDetail?.code;
  if (
    code === "unsupported_photo" ||
    code === "invalid_photo" ||
    code === "unsupported_photo_type"
  )
    return "photo_invalid";
  if (code === "photo_too_large") return "photo_too_large";
  if (code === "caption_too_long")
    return attachmentKind === "file"
      ? "file_caption_too_long"
      : "photo_caption_too_long";
  if (code === "photo_storage_unavailable") return "photo_storage_unavailable";
  if (code === "invalid_file") return "file_empty";
  if (code === "file_too_large") return "file_too_large";
  if (code === "file_caption_too_long") return "file_caption_too_long";
  if (code === "file_storage_unavailable") return "file_storage_unavailable";
  if (code === "media_storage_unavailable") return "media_storage_unavailable";
  if (error.response.status === 413)
    return attachmentKind === "file" || attachmentKind === "media"
      ? "file_too_large"
      : "photo_too_large";
  if (error.response.status === 415)
    return attachmentKind === "file" || attachmentKind === "media"
      ? "failed"
      : "photo_invalid";
  if (
    code === "connection_unavailable" ||
    code === "channel_credentials_unavailable"
  )
    return "connection";
  if (code === "missing_permissions") return "permissions";
  const status = errorDetail?.delivery_status;
  if (status === "failed") return "failed";
  if (status === "unknown" || status === "pending") return "uncertain";
  if (code === "unsupported_conversation") return "unavailable";
  if (code === "client_message_conflict") return "conflict";
  if (error.response.status === 403) return "forbidden";
  if (error.response.status === 404) return "unavailable";
  if (error.response.status >= 500) return "uncertain";
  return "general";
}

export function useSendMessage(workspaceId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendInput) =>
      input.kind === "photo"
        ? sendPhoto(conversationId, input)
        : input.kind === "file"
          ? sendFile(conversationId, input)
          : input.kind === "media"
            ? sendMedia(conversationId, input)
            : sendMessage(conversationId, {
                text: input.text,
                client_message_id: input.clientMessageId,
              }),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: conversationsQueryKey(workspaceId),
      }),
  });
}
