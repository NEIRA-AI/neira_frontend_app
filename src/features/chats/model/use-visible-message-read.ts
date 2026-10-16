import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useEffect, useRef, type RefObject } from "react";

import {
  conversationQueryKey,
  conversationsQueryKey,
  markMessagesRead,
  unreadChatCountQueryKey,
  type ChatMessage,
  type Conversation,
  type ConversationPage,
} from "../api/conversations-api";

type VisibilityHandler = (id: string) => void;

export function useVisibleMessageRead({
  conversationId,
  messages,
  scrollRef,
  workspaceId,
}: {
  conversationId: string;
  messages: ChatMessage[];
  scrollRef: RefObject<HTMLDivElement | null>;
  workspaceId: string;
}) {
  const queryClient = useQueryClient();
  const onVisibleRef = useRef<VisibilityHandler>(() => {});

  useEffect(() => {
    if (!conversationId || !workspaceId) return;
    const pending = new Set<string>();
    const inFlight = new Set<string>();
    const acknowledged = new Set<string>();
    const controller = new AbortController();
    let active = true;
    let sending = false;
    let timer: number | null = null;

    function schedule(delay = 120) {
      if (!active || timer !== null || sending || !pending.size) return;
      timer = window.setTimeout(() => {
        timer = null;
        void flush();
      }, delay);
    }

    async function flush() {
      if (!active || sending || !pending.size) return;
      if (document.visibilityState !== "visible" || !document.hasFocus())
        return;
      sending = true;
      let retryAfterFailure = false;
      const ids = Array.from(pending).slice(0, 100);
      ids.forEach((id) => {
        pending.delete(id);
        inFlight.add(id);
      });
      const listKey = conversationsQueryKey(workspaceId);
      const detailKey = conversationQueryKey(workspaceId, conversationId);
      const originalList = queryClient.getQueryData(listKey);
      const originalDetail = queryClient.getQueryData(detailKey);
      const listWasFetching =
        queryClient.getQueryState(listKey)?.fetchStatus === "fetching";
      const detailWasFetching =
        queryClient.getQueryState(detailKey)?.fetchStatus === "fetching";
      try {
        const { unread_count: unreadCount, changed } = await markMessagesRead(
          conversationId,
          ids,
          controller.signal,
        );
        if (!active) return;
        ids.forEach((id) => acknowledged.add(id));
        if (!changed) return;
        if (
          originalList &&
          !listWasFetching &&
          queryClient.getQueryState(listKey)?.fetchStatus !== "fetching" &&
          queryClient.getQueryData(listKey) === originalList
        ) {
          queryClient.setQueryData<InfiniteData<ConversationPage>>(
            listKey,
            (current) =>
              current
                ? {
                    ...current,
                    pages: current.pages.map((page) => ({
                      ...page,
                      items: page.items.map((item) =>
                        item.id === conversationId
                          ? { ...item, unread_count: unreadCount }
                          : item,
                      ),
                    })),
                  }
                : current,
          );
        } else {
          void queryClient.invalidateQueries({
            queryKey: listKey,
            exact: true,
          });
        }
        if (
          originalDetail &&
          !detailWasFetching &&
          queryClient.getQueryState(detailKey)?.fetchStatus !== "fetching" &&
          queryClient.getQueryData(detailKey) === originalDetail
        ) {
          queryClient.setQueryData<Conversation>(detailKey, (current) =>
            current ? { ...current, unread_count: unreadCount } : current,
          );
        } else {
          void queryClient.invalidateQueries({
            queryKey: detailKey,
            exact: true,
          });
        }
        void queryClient.invalidateQueries({
          queryKey: unreadChatCountQueryKey(workspaceId),
          exact: true,
        });
      } catch {
        if (active) ids.forEach((id) => pending.add(id));
        retryAfterFailure = true;
      } finally {
        ids.forEach((id) => inFlight.delete(id));
        sending = false;
        if (active) schedule(retryAfterFailure ? 3_000 : 120);
      }
    }

    onVisibleRef.current = (id) => {
      if (acknowledged.has(id) || pending.has(id) || inFlight.has(id)) return;
      pending.add(id);
      schedule();
    };

    const onFocus = () => schedule();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      active = false;
      controller.abort();
      if (timer !== null) window.clearTimeout(timer);
      onVisibleRef.current = () => {};
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [conversationId, queryClient, workspaceId]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !conversationId || !workspaceId) return;

    const incoming = new Set(
      messages
        .filter((message) => message.direction === "inbound")
        .map((message) => message.id),
    );
    const elements = Array.from(
      root.querySelectorAll<HTMLElement>("[data-message-id]"),
    ).filter((element) => incoming.has(element.dataset.messageId ?? ""));
    const observer = new IntersectionObserver(
      (entries) => {
        if (document.visibilityState !== "visible" || !document.hasFocus())
          return;
        for (const entry of entries) {
          const visibleHeight = entry.intersectionRect.height;
          const requiredHeight = Math.min(
            48,
            entry.boundingClientRect.height * 0.5,
          );
          if (!entry.isIntersecting || visibleHeight < requiredHeight) continue;
          const id = (entry.target as HTMLElement).dataset.messageId;
          if (id) onVisibleRef.current(id);
        }
      },
      { root, threshold: [0, 0.25, 0.5, 1] },
    );

    function observeVisibleAgain() {
      if (document.visibilityState !== "visible" || !document.hasFocus())
        return;
      elements.forEach((element) => {
        observer.unobserve(element);
        observer.observe(element);
      });
    }

    elements.forEach((element) => observer.observe(element));
    window.addEventListener("focus", observeVisibleAgain);
    document.addEventListener("visibilitychange", observeVisibleAgain);

    return () => {
      observer.disconnect();
      window.removeEventListener("focus", observeVisibleAgain);
      document.removeEventListener("visibilitychange", observeVisibleAgain);
    };
  }, [conversationId, messages, scrollRef, workspaceId]);
}
