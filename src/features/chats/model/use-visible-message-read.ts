import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, type RefObject } from "react";

import {
  conversationQueryKey,
  conversationsQueryKey,
  markMessagesRead,
  type ChatMessage,
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
      ids.forEach((id) => pending.delete(id));
      try {
        await markMessagesRead(conversationId, ids, controller.signal);
        if (!active) return;
        ids.forEach((id) => acknowledged.add(id));
        void queryClient.invalidateQueries({
          queryKey: conversationsQueryKey(workspaceId),
          exact: true,
        });
        void queryClient.invalidateQueries({
          queryKey: conversationQueryKey(workspaceId, conversationId),
        });
      } catch {
        if (active) ids.forEach((id) => pending.add(id));
        retryAfterFailure = true;
      } finally {
        sending = false;
        if (active) schedule(retryAfterFailure ? 3_000 : 120);
      }
    }

    onVisibleRef.current = (id) => {
      if (acknowledged.has(id) || pending.has(id)) return;
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
