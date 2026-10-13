import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { ChatMessage } from "../api/conversations-api";

const bottomThreshold = 96;

export function useThreadScroll({
  conversationId,
  hasNextPage,
  isError,
  isFetchingNextPage,
  messages,
  onLoadMore,
}: {
  conversationId: string;
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  messages: ChatMessage[];
  onLoadMore: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const olderSentinelRef = useRef<HTMLDivElement>(null);
  const initializedIdRef = useRef<string | null>(null);
  const newestRef = useRef<string | null>(null);
  const atBottomRef = useRef(true);
  const snapshotRef = useRef<{
    height: number;
    top: number;
    count: number;
  } | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const newest = messages.at(-1);

  useLayoutEffect(() => {
    const root = scrollRef.current;
    if (!root || !newest) return;

    if (initializedIdRef.current !== conversationId) {
      initializedIdRef.current = conversationId;
      newestRef.current = newest.id;
      snapshotRef.current = null;
      root.scrollTop = root.scrollHeight;
      atBottomRef.current = true;
      setIsAtBottom(true);
      setHasNewMessage(false);
      return;
    }

    const snapshot = snapshotRef.current;
    if (snapshot && messages.length > snapshot.count) {
      root.scrollTop = snapshot.top + root.scrollHeight - snapshot.height;
      snapshotRef.current = null;
    }

    const previous = newestRef.current;
    if (previous && previous !== newest.id) {
      if (atBottomRef.current) {
        root.scrollTop = root.scrollHeight;
      } else {
        setHasNewMessage(true);
      }
    }
    newestRef.current = newest.id;
  }, [conversationId, messages, newest]);

  useEffect(() => {
    if (!isFetchingNextPage && snapshotRef.current?.count === messages.length) {
      snapshotRef.current = null;
    }
  }, [isFetchingNextPage, messages.length]);

  useEffect(() => {
    const root = scrollRef.current;
    const content = root?.firstElementChild;
    if (!root || !content) return;
    const observer = new ResizeObserver(() => {
      if (initializedIdRef.current !== conversationId) return;
      if (atBottomRef.current) root.scrollTop = root.scrollHeight;
    });
    observer.observe(root);
    observer.observe(content);
    return () => observer.disconnect();
  }, [conversationId, messages.length]);

  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = olderSentinelRef.current;
    if (
      !root ||
      !sentinel ||
      !hasNextPage ||
      isError ||
      isFetchingNextPage ||
      initializedIdRef.current !== conversationId
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        if (snapshotRef.current) return;
        snapshotRef.current = {
          height: root.scrollHeight,
          top: root.scrollTop,
          count: messages.length,
        };
        onLoadMore();
      },
      { root, rootMargin: "160px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    conversationId,
    hasNextPage,
    isError,
    isFetchingNextPage,
    messages.length,
    onLoadMore,
  ]);

  function onScroll() {
    const root = scrollRef.current;
    if (!root) return;
    const atBottom =
      root.scrollHeight - root.scrollTop - root.clientHeight <= bottomThreshold;
    atBottomRef.current = atBottom;
    setIsAtBottom(atBottom);
    if (atBottom) setHasNewMessage(false);
  }

  function jumpToBottom() {
    const root = scrollRef.current;
    if (!root) return;
    root.scrollTo({ top: root.scrollHeight, behavior: "smooth" });
    setHasNewMessage(false);
  }

  return {
    scrollRef,
    olderSentinelRef,
    isAtBottom,
    hasNewMessage,
    onScroll,
    jumpToBottom,
  };
}
