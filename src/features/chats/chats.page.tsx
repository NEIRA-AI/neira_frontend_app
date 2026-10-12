import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { useAuth } from "@/features/auth";

import type { ChatMessage, Conversation } from "./api/conversations-api";
import {
  useConversation,
  useListConversations,
} from "./model/use-list-conversations";
import { useListMessages } from "./model/use-list-messages";
import { ActiveConversation } from "./ui/active-conversation";
import { ConversationList } from "./ui/conversation-list";

function uniqueConversations(pages: Conversation[][]): Conversation[] {
  const seen = new Set<string>();
  return pages.flatMap((items) =>
    items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    }),
  );
}

function chronologicalMessages(pages: ChatMessage[][]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  pages.forEach((items) => items.forEach((item) => byId.set(item.id, item)));
  return Array.from(byId.values()).sort((a, b) => a.sequence - b.sequence);
}

function ChatsPage() {
  const { t } = useTranslation("chats");
  const { workspaceId, workspaces } = useAuth();
  const { conversationId } = useParams<"conversationId">();
  const workspace = workspaceId ?? "";
  const role = workspaces.find((item) => item.id === workspaceId)?.role;
  const canSend = role === "owner" || role === "admin" || role === "manager";
  const selectedId = conversationId ?? "";
  const conversationsQuery = useListConversations(workspace);
  const conversationQuery = useConversation(workspace, selectedId);
  const messagesQuery = useListMessages(workspace, selectedId);
  const {
    fetchNextPage: fetchNextConversationsPage,
    hasNextPage: hasNextConversationsPage,
    isFetchingNextPage: isFetchingNextConversationsPage,
  } = conversationsQuery;
  const {
    fetchNextPage: fetchNextMessagesPage,
    hasNextPage: hasNextMessagesPage,
    isFetchingNextPage: isFetchingNextMessagesPage,
  } = messagesQuery;
  const conversations = useMemo(
    () =>
      uniqueConversations(
        conversationsQuery.data?.pages.map((page) => page.items) ?? [],
      ),
    [conversationsQuery.data],
  );
  const messages = useMemo(
    () =>
      chronologicalMessages(
        messagesQuery.data?.pages.map((page) => page.items) ?? [],
      ),
    [messagesQuery.data],
  );
  const selectedConversation =
    conversationQuery.data ??
    conversations.find((conversation) => conversation.id === selectedId) ??
    null;

  const loadMoreConversations = useCallback(() => {
    if (hasNextConversationsPage && !isFetchingNextConversationsPage) {
      void fetchNextConversationsPage();
    }
  }, [
    fetchNextConversationsPage,
    hasNextConversationsPage,
    isFetchingNextConversationsPage,
  ]);

  const loadOlderMessages = useCallback(() => {
    if (hasNextMessagesPage && !isFetchingNextMessagesPage) {
      void fetchNextMessagesPage();
    }
  }, [fetchNextMessagesPage, hasNextMessagesPage, isFetchingNextMessagesPage]);

  return (
    <div className="h-[calc(100dvh-4rem-var(--impersonation-banner-height,0px))] min-h-[calc(100dvh-4rem-var(--impersonation-banner-height,0px))] min-w-0 bg-page text-ink lg:h-[calc(100dvh-var(--impersonation-banner-height,0px))] lg:min-h-[calc(100dvh-var(--impersonation-banner-height,0px))]">
      <div className="grid h-full min-h-0 min-w-0 md:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <div className={`min-h-0 ${selectedId ? "hidden md:block" : ""}`}>
          <ConversationList
            conversations={conversations}
            hasNextPage={Boolean(conversationsQuery.hasNextPage)}
            isError={conversationsQuery.isError}
            isFetchingNextPage={conversationsQuery.isFetchingNextPage}
            isPending={conversationsQuery.isPending}
            onLoadMore={loadMoreConversations}
            onRetry={() => void conversationsQuery.refetch()}
            selectedId={selectedId || null}
          />
        </div>
        {selectedId ? (
          <ActiveConversation
            canSend={canSend}
            conversation={selectedConversation}
            conversationId={selectedId}
            key={`${workspace}:${selectedId}`}
            hasNextPage={Boolean(messagesQuery.hasNextPage)}
            isError={messagesQuery.isError}
            isFetchingNextPage={messagesQuery.isFetchingNextPage}
            isPending={messagesQuery.isPending}
            messages={messages}
            onLoadMore={loadOlderMessages}
            onRetry={() => void messagesQuery.refetch()}
            workspaceId={workspace}
          />
        ) : (
          <div className="hidden min-h-0 items-center justify-center px-8 text-center md:flex">
            <div>
              <h2 className="text-lg font-semibold">
                {t("selectConversation")}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {t("selectConversationHelp")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const Component = ChatsPage;
