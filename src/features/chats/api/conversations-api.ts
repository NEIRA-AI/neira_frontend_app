import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type ChatMessage = components["schemas"]["ConversationMessage"];
export type MessageAuthor = components["schemas"]["ConversationMessageAuthor"];
export type Conversation = components["schemas"]["ConversationSummary"];
export type ConversationPage = components["schemas"]["ConversationPage"];
export type MessagePage = components["schemas"]["ConversationMessagePage"];
export type SendMessageRequest =
  components["schemas"]["ConversationSendRequest"];
type UnreadChatCount = components["schemas"]["ConversationUnreadCount"];
type ReadRequest = components["schemas"]["ConversationReadRequest"];
type ReadResult = components["schemas"]["ConversationReadResult"];

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
