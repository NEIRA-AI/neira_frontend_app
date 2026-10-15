import { api } from "@/shared/api/client";
import type { components, paths } from "@/shared/api/generated/schema";

export type ChatMessage = components["schemas"]["ConversationMessage"];
export type MessageAuthor = components["schemas"]["ConversationMessageAuthor"];
export type Conversation = components["schemas"]["ConversationSummary"];
export type ConversationPage = components["schemas"]["ConversationPage"];
export type MessagePage = components["schemas"]["ConversationMessagePage"];
export type SendMessageRequest =
  components["schemas"]["ConversationSendRequest"];
type SendPhotoBody =
  paths["/api/v1/conversations/{conversation_id}/messages/photo"]["post"]["requestBody"]["content"]["multipart/form-data"];
type SendPhotoRequest = {
  clientMessageId: SendPhotoBody["client_message_id"];
  photo: File;
  caption: SendPhotoBody["caption"];
};
type SendFileBody =
  paths["/api/v1/conversations/{conversation_id}/messages/file"]["post"]["requestBody"]["content"]["multipart/form-data"];
type SendFileRequest = {
  clientMessageId: SendFileBody["client_message_id"];
  file: File;
  caption: SendFileBody["caption"];
};
type SendMediaBody =
  paths["/api/v1/conversations/{conversation_id}/messages/media"]["post"]["requestBody"]["content"]["multipart/form-data"];
export type MediaAttachment = {
  kind: SendMediaBody["attachment_kinds"][number];
  file: File;
};
type SendMediaRequest = {
  clientMessageId: SendMediaBody["client_message_id"];
  attachments: MediaAttachment[];
  caption: SendMediaBody["caption"];
};
type UnreadChatCount = components["schemas"]["ConversationUnreadCount"];
type ReadRequest = components["schemas"]["ConversationReadRequest"];
type ReadResult = components["schemas"]["ConversationReadResult"];
type CancelResult = components["schemas"]["ConversationCancelResult"];
type FailedMessagePage = components["schemas"]["ConversationFailedMessagePage"];

export const conversationsQueryKey = (workspaceId: string) =>
  ["private", "conversations", workspaceId] as const;

export const unreadChatCountQueryKey = (workspaceId: string) =>
  [...conversationsQueryKey(workspaceId), "unread-count"] as const;

export const conversationQueryKey = (workspaceId: string, id: string) =>
  [...conversationsQueryKey(workspaceId), "detail", id] as const;

export const messagesQueryKey = (workspaceId: string, id: string) =>
  [...conversationsQueryKey(workspaceId), "messages", id] as const;

export const messageAuthorsQueryKey = (workspaceId: string, id: string) =>
  [...conversationsQueryKey(workspaceId), "message-authors", id] as const;

export const messageAuthorQueryKey = (
  workspaceId: string,
  conversationId: string,
  messageId: string,
) =>
  [...messageAuthorsQueryKey(workspaceId, conversationId), messageId] as const;

export async function listConversations(
  cursor: string | null,
): Promise<ConversationPage> {
  const { data } = await api.get<ConversationPage>("/conversations", {
    params: { limit: 50, cursor: cursor ?? undefined },
    workspace: true,
  });
  return data;
}

export async function getConversation(id: string): Promise<Conversation> {
  const { data } = await api.get<Conversation>(
    `/conversations/${encodeURIComponent(id)}`,
    { workspace: true },
  );
  return data;
}

export async function getUnreadChatCount(): Promise<number> {
  const { data } = await api.get<UnreadChatCount>(
    "/conversations/unread-count",
    { workspace: true },
  );
  return data.unread_count;
}

export async function listMessages(
  conversationId: string,
  cursor: string | null,
): Promise<MessagePage> {
  const { data } = await api.get<MessagePage>(
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      params: { limit: 50, cursor: cursor ?? undefined },
      workspace: true,
    },
  );
  return data;
}

export async function getMessage(
  conversationId: string,
  messageId: string,
): Promise<ChatMessage> {
  const { data } = await api.get<ChatMessage>(
    `/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`,
    { workspace: true },
  );
  return data;
}

export async function getMessageAuthor(
  conversationId: string,
  messageId: string,
): Promise<MessageAuthor> {
  const { data } = await api.get<MessageAuthor>(
    `/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/author`,
    { workspace: true },
  );
  return data;
}

export async function sendMessage(
  conversationId: string,
  request: SendMessageRequest,
): Promise<ChatMessage> {
  const { data } = await api.post<ChatMessage>(
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
    request,
    { workspace: true, timeout: 25_000 },
  );
  return data;
}

export async function sendPhoto(
  conversationId: string,
  request: SendPhotoRequest,
): Promise<ChatMessage> {
  const form = new FormData();
  form.append("client_message_id", request.clientMessageId);
  form.append("photo", request.photo);
  if (request.caption) form.append("caption", request.caption);

  const { data } = await api.post<ChatMessage>(
    `/conversations/${encodeURIComponent(conversationId)}/messages/photo`,
    form,
    { workspace: true, timeout: 120_000 },
  );
  return data;
}

export async function sendFile(
  conversationId: string,
  request: SendFileRequest,
): Promise<ChatMessage> {
  const form = new FormData();
  form.append("client_message_id", request.clientMessageId);
  form.append("file", request.file);
  if (request.caption) form.append("caption", request.caption);

  const { data } = await api.post<ChatMessage>(
    `/conversations/${encodeURIComponent(conversationId)}/messages/file`,
    form,
    { workspace: true, timeout: 300_000 },
  );
  return data;
}

export async function sendMedia(
  conversationId: string,
  request: SendMediaRequest,
): Promise<ChatMessage> {
  const form = new FormData();
  form.append("client_message_id", request.clientMessageId);
  if (request.caption) form.append("caption", request.caption);
  for (const attachment of request.attachments) {
    form.append("attachments", attachment.file);
    form.append("attachment_kinds", attachment.kind);
  }

  const { data } = await api.post<ChatMessage>(
    `/conversations/${encodeURIComponent(conversationId)}/messages/media`,
    form,
    { workspace: true, timeout: 300_000 },
  );
  return data;
}

export async function retryMessage(
  conversationId: string,
  messageId: string,
): Promise<ChatMessage> {
  const { data } = await api.post<ChatMessage>(
    `/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/retry`,
    undefined,
    { workspace: true, timeout: 120_000 },
  );
  return data;
}

export async function cancelFailedMessage(
  conversationId: string,
  messageId: string,
): Promise<void> {
  await api.delete(
    `/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`,
    { workspace: true },
  );
}

export async function cancelAllFailedMessages(
  conversationId: string,
): Promise<number> {
  const { data } = await api.delete<CancelResult>(
    `/conversations/${encodeURIComponent(conversationId)}/failed-messages`,
    { workspace: true },
  );
  return data.cancelled_count;
}

export async function listFailedMessageIds(
  conversationId: string,
  cursor: string | null,
): Promise<FailedMessagePage> {
  const { data } = await api.get<FailedMessagePage>(
    `/conversations/${encodeURIComponent(conversationId)}/failed-messages`,
    {
      params: { limit: 100, cursor: cursor ?? undefined },
      workspace: true,
    },
  );
  return data;
}

export async function markMessagesRead(
  conversationId: string,
  messageIds: string[],
  signal?: AbortSignal,
): Promise<number> {
  const request: ReadRequest = { message_ids: messageIds };
  const { data } = await api.post<ReadResult>(
    `/conversations/${encodeURIComponent(conversationId)}/read`,
    request,
    { workspace: true, signal },
  );
  return data.unread_count;
}

export function messageText(message: ChatMessage | null): string {
  if (!message) return "";
  return message.parts
    .filter((part) => part.kind === "text" && part.text)
    .map((part) => part.text)
    .join(" ");
}

export function messagePreview(
  message: ChatMessage | null,
  labels: { photo: string; file: string; voice: string },
): string {
  if (!message) return "";
  const text = messageText(message);
  const seen = new Set<string>();
  const media = message.parts
    .filter(
      (part) =>
        part.kind === "image" || part.kind === "file" || part.kind === "voice",
    )
    .sort((a, b) => a.position - b.position)
    .flatMap((part) => {
      if (seen.has(part.kind)) return [];
      seen.add(part.kind);
      return [
        part.kind === "image"
          ? labels.photo
          : part.kind === "voice"
            ? labels.voice
            : labels.file,
      ];
    });
  if (text) media.push(text);
  return media.join(" · ");
}
