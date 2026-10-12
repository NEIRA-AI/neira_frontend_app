import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ChatMessage, Conversation } from "../api/conversations-api";

import { ConversationAuthorPanel } from "./conversation-author-panel";
import { ConversationContactPanel } from "./conversation-contact-panel";
import { MessageThread } from "./message-thread";

type PanelTarget =
  | {
      kind: "contact";
      contactId: string | null;
      identityId: string | null;
      name: string;
      avatarUrl: string | null;
    }
  | {
      kind: "author";
      messageId: string;
      name: string;
      avatarUrl: string | null;
    };

export function ActiveConversation({
  canSend,
  conversation,
  conversationId,
  hasNextPage,
  isError,
  isFetchingNextPage,
  isPending,
  messages,
  onLoadMore,
  onRetry,
  workspaceId,
}: {
  canSend: boolean;
  conversation: Conversation | null;
  conversationId: string;
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  messages: ChatMessage[];
  onLoadMore: () => void;
  onRetry: () => void;
  workspaceId: string;
}) {
  const { t } = useTranslation("chats");
  const [panelTarget, setPanelTarget] = useState<PanelTarget | null>(null);
  const [isWide, setIsWide] = useState(
    () => window.matchMedia("(min-width: 1280px)").matches,
  );
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const panelOpen = Boolean(panelTarget && conversation);
  const panelTitle =
    panelTarget?.kind === "author"
      ? t("authorPanelTitle")
      : t("contactPanelTitle");

  function renderPanel(mode: "drawer" | "inline") {
    if (!panelTarget || !conversation) return null;
    if (panelTarget.kind === "author") {
      return (
        <ConversationAuthorPanel
          avatarUrl={panelTarget.avatarUrl}
          closeButtonRef={closeButtonRef}
          conversationId={conversationId}
          key={panelTarget.messageId}
          messageId={panelTarget.messageId}
          mode={mode}
          name={panelTarget.name}
          onClose={closePanel}
          workspaceId={workspaceId}
        />
      );
    }
    return (
      <ConversationContactPanel
        closeButtonRef={closeButtonRef}
        contactId={panelTarget.contactId}
        conversation={conversation}
        fallbackAvatarUrl={panelTarget.avatarUrl}
        fallbackName={panelTarget.name}
        identityId={panelTarget.identityId}
        mode={mode}
        onClose={closePanel}
        workspaceId={workspaceId}
      />
    );
  }

  const closePanel = useCallback(() => {
    setPanelTarget(null);
    if (isWide) {
      window.requestAnimationFrame(() => returnFocusRef.current?.focus());
    }
  }, [isWide]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsWide(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!panelTarget || !isWide) return;
    closeButtonRef.current?.focus();
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closePanel();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closePanel, isWide, panelTarget]);

  return (
    <div
      className={`relative grid h-full min-h-0 min-w-0 ${panelOpen ? "xl:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]" : ""}`}
    >
      <MessageThread
        canSend={canSend}
        conversation={conversation}
        conversationId={conversationId}
        hasNextPage={hasNextPage}
        isContactPanelOpen={panelOpen && panelTarget?.kind === "contact"}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        isPending={isPending}
        messages={messages}
        onLoadMore={onLoadMore}
        onOpenContact={(contactId, identityId, trigger, fallback) => {
          returnFocusRef.current = trigger;
          setPanelTarget({
            kind: "contact",
            contactId,
            identityId,
            name: fallback.name,
            avatarUrl: fallback.avatarUrl,
          });
        }}
        onOpenAuthor={(message, trigger) => {
          returnFocusRef.current = trigger;
          setPanelTarget({
            kind: "author",
            messageId: message.id,
            name: message.author_name ?? t("unknownParticipant"),
            avatarUrl: message.author_avatar_url,
          });
        }}
        onRetry={onRetry}
        workspaceId={workspaceId}
      />
      {panelOpen && isWide && renderPanel("inline")}
      {!isWide && (
        <Dialog.Root
          onOpenChange={(open) => {
            if (!open) closePanel();
          }}
          open={panelOpen}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink-20" />
            <Dialog.Content
              aria-describedby={undefined}
              className="fixed inset-y-0 right-0 z-[61] w-full outline-none sm:w-[min(420px,100%)]"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                returnFocusRef.current?.focus();
              }}
            >
              <Dialog.Title className="sr-only">{panelTitle}</Dialog.Title>
              {panelOpen && renderPanel("drawer")}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}
