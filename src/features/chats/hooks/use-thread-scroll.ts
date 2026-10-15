import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { ChatMessage } from "../api/conversations-api";

const bottomThreshold = 96;

function scrollToMessage(
  root: HTMLDivElement,
  messageId: string,
  behavior: ScrollBehavior,
) {
  const message = Array.from(
    root.querySelectorAll<HTMLElement>("[data-message-id]"),
  ).find((item) => item.dataset.messageId === messageId);
  if (!message) return false;

  root.scrollTo({
    top:
      root.scrollTop +
      message.getBoundingClientRect().bottom -
      root.getBoundingClientRect().bottom +
      16,
    behavior,
  });
  return true;
}

export function useThreadScroll({
  conversationId,
  hasNextPage,
  isError,
  isFetchingNextPage,
  messages,
  onLoadMore,
  visibleMessages,
  visibleMessagesHidden,
}: {
  conversationId: string;
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  messages: ChatMessage[];
  onLoadMore: () => void;
  visibleMessages: ChatMessage[];
  visibleMessagesHidden: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const olderSentinelRef = useRef<HTMLDivElement>(null);
  const initializedIdRef = useRef<string | null>(null);
  const newestRef = useRef<string | null>(null);
  const visibleIdsRef = useRef<Set<string>>(new Set());
  const visibleMessagesHiddenRef = useRef(visibleMessagesHidden);
  const atBottomRef = useRef(true);
  const snapshotRef = useRef<{
    height: number;
    top: number;
    count: number;
  } | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const newest = messages.at(-1);
  const visibleIds = useMemo(
    () => new Set(visibleMessages.map((message) => message.id)),
    [visibleMessages],
  );
  const newestVisibleMessageId =
    messages.findLast((message) => visibleIds.has(message.id))?.id ?? null;
  const newestIsDisplayedLast =
    visibleMessages.at(-1)?.id === newestVisibleMessageId;

  useLayoutEffect(() => {
    const root = scrollRef.current;
    if (!root || !newest) return;

    if (initializedIdRef.current !== conversationId) {
      initializedIdRef.current = conversationId;
      newestRef.current = newestVisibleMessageId;
      visibleIdsRef.current = visibleIds;
      visibleMessagesHiddenRef.current = visibleMessagesHidden;
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
    const visibilityChanged =
      visibleMessagesHiddenRef.current !== visibleMessagesHidden;
    const newVisibleMessage =
      !visibilityChanged &&
      previous &&
      newestVisibleMessageId &&
      !visibleIdsRef.current.has(newestVisibleMessageId);
    if (newVisibleMessage) {
      if (atBottomRef.current) {
        if (
          !newestIsDisplayedLast &&
          scrollToMessage(root, newestVisibleMessageId, "auto")
        ) {
          atBottomRef.current = false;
          setIsAtBottom(false);
        } else {
          root.scrollTop = root.scrollHeight;
        }
      } else {
        setHasNewMessage(true);
      }
    } else if (previous && !visibleIds.has(previous)) {
      setHasNewMessage(false);
    }
    newestRef.current = newestVisibleMessageId;
    visibleIdsRef.current = visibleIds;
    visibleMessagesHiddenRef.current = visibleMessagesHidden;
  }, [
    conversationId,
    messages,
    newest,
    newestIsDisplayedLast,
    newestVisibleMessageId,
    visibleIds,
    visibleMessagesHidden,
  ]);

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

  function jumpToNewMessage() {
    const root = scrollRef.current;
    if (!root) return;
    const latestId = newestRef.current;
    if (
      !latestId ||
      newestIsDisplayedLast ||
      !scrollToMessage(root, latestId, "smooth")
    ) {
      root.scrollTo({ top: root.scrollHeight, behavior: "smooth" });
    }
    setHasNewMessage(false);
  }

  return {
    scrollRef,
    olderSentinelRef,
    isAtBottom,
    hasNewMessage,
    onScroll,
    jumpToBottom,
    jumpToNewMessage,
  };
}
