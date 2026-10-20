import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth";

import type { ChatMessage, Conversation } from "../api/conversations-api";

import { ConversationAuthorPanel } from "./conversation-author-panel";
import { ConversationContactPanel } from "./conversation-contact-panel";
import { ConversationNotesPanel } from "./conversation-notes-panel";
import { MessageThread } from "./message-thread";

type ContactTarget = {
  kind: "contact";
  contactId: string | null;
  identityId: string | null;
  name: string;
  avatarUrl: string | null;
};

type AuthorTarget = {
  kind: "author";
  messageId: string;
  name: string;
  avatarUrl: string | null;
};

type NotesTarget = { kind: "notes" };

type ScopedTarget<T> = {
  conversationId: string;
  userId: string | null;
  workspaceId: string;
  target: T;
};

function readContactPanelPreference(storageKey: string | null) {
  if (!storageKey) return false;
  try {
    return window.localStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
}

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
  const { user } = useAuth();
  const storageKey =
    user?.id && workspaceId
      ? `neira.chats.contact-panel-open:${user.id}:${workspaceId}`
      : null;
  const [storedPreference, setStoredPreference] = useState(() => ({
    storageKey,
    open: readContactPanelPreference(storageKey),
  }));
  const isContactPanelPreferredOpen =
    storedPreference.storageKey === storageKey
      ? storedPreference.open
      : readContactPanelPreference(storageKey);
  const [selectedContact, setSelectedContact] =
    useState<ScopedTarget<ContactTarget> | null>(null);
  const [selectedAuthor, setSelectedAuthor] =
    useState<ScopedTarget<AuthorTarget> | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [isWide, setIsWide] = useState(
    () => window.matchMedia("(min-width: 1280px)").matches,
  );
  const authorBackButtonRef = useRef<HTMLButtonElement>(null);
  const authorTitleRef = useRef<HTMLHeadingElement>(null);
  const contactTitleRef = useRef<HTMLHeadingElement>(null);
  const notesTitleRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const currentConversation =
    conversation?.id === conversationId ? conversation : null;
  const currentContact: ContactTarget | null =
    currentConversation?.kind === "external"
      ? {
          kind: "contact",
          contactId: currentConversation.contact_id,
          identityId: currentConversation.primary_external_identity_id,
          name: currentConversation.title,
          avatarUrl: currentConversation.avatar_url,
        }
      : null;
  const contactOverride =
    selectedContact?.conversationId === conversationId &&
    selectedContact.userId === (user?.id ?? null) &&
    selectedContact.workspaceId === workspaceId
      ? selectedContact.target
      : null;
  const authorOverride =
    selectedAuthor?.conversationId === conversationId &&
    selectedAuthor.userId === (user?.id ?? null) &&
    selectedAuthor.workspaceId === workspaceId
      ? selectedAuthor.target
      : null;
  const panelTarget =
    authorOverride ??
    (notesOpen ? ({ kind: "notes" } satisfies NotesTarget) : null) ??
    (isContactPanelPreferredOpen ? (contactOverride ?? currentContact) : null);
  const panelOpen = Boolean(panelTarget && currentConversation);
  const panelKind = panelTarget?.kind ?? null;
  const panelTargetKey =
    panelTarget?.kind === "author"
      ? `author:${panelTarget.messageId}`
      : panelTarget?.kind === "notes"
        ? `notes:${conversationId}`
        : panelTarget?.kind === "contact"
          ? `contact:${panelTarget.contactId}:${panelTarget.identityId}`
          : null;
  const panelTitle =
    panelTarget?.kind === "author"
      ? t("authorPanelTitle")
      : panelTarget?.kind === "notes"
        ? t("conversationNotesPanelTitle")
        : t("contactPanelTitle");

  function renderPanel(mode: "drawer" | "inline") {
    if (!panelTarget || !currentConversation) return null;
    if (panelTarget.kind === "author") {
      return (
        <ConversationAuthorPanel
          avatarUrl={panelTarget.avatarUrl}
          backButtonRef={authorBackButtonRef}
          conversationId={conversationId}
          key={panelTarget.messageId}
          messageId={panelTarget.messageId}
          mode={mode}
          name={panelTarget.name}
          onBack={currentContact ? backToContact : undefined}
          titleRef={authorTitleRef}
          workspaceId={workspaceId}
        />
      );
    }
    if (panelTarget.kind === "notes") {
      return (
        <ConversationNotesPanel
          canWrite={canSend}
          conversationId={conversationId}
          mode={mode}
          titleRef={notesTitleRef}
          workspaceId={workspaceId}
        />
      );
    }
    return (
      <ConversationContactPanel
        canWriteNotes={canSend}
        contactId={panelTarget.contactId}
        fallbackAvatarUrl={panelTarget.avatarUrl}
        fallbackName={panelTarget.name}
        identityId={panelTarget.identityId}
        key={`${workspaceId}:${panelTarget.contactId}`}
        mode={mode}
        titleRef={contactTitleRef}
        workspaceId={workspaceId}
      />
    );
  }

  const setContactPanelPreference = useCallback(
    (open: boolean) => {
      setStoredPreference({ storageKey, open });
      if (!storageKey) return;
      try {
        window.localStorage.setItem(storageKey, String(open));
      } catch {
        // The panel still works for this session when storage is unavailable.
      }
    },
    [storageKey],
  );

  const focusPanelTrigger = useCallback(() => {
    const trigger = returnFocusRef.current;
    const target = trigger?.isConnected
      ? trigger
      : document.getElementById("chat-panel-toggle");
    target?.focus();
  }, []);

  const closePanel = useCallback(() => {
    setSelectedAuthor(null);
    setSelectedContact(null);
    setNotesOpen(false);
    setContactPanelPreference(false);
    if (isWide) {
      window.requestAnimationFrame(focusPanelTrigger);
    }
  }, [focusPanelTrigger, isWide, setContactPanelPreference]);

  function backToContact() {
    setSelectedAuthor(null);
    setSelectedContact(null);
    setNotesOpen(false);
    setContactPanelPreference(true);
    window.requestAnimationFrame(() => {
      if (currentContact) contactTitleRef.current?.focus();
      else focusPanelTrigger();
    });
  }

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsWide(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!panelOpen || !isWide) return;
    if (returnFocusRef.current) {
      if (panelKind === "author") {
        (authorBackButtonRef.current ?? authorTitleRef.current)?.focus();
      } else if (panelKind === "notes") {
        notesTitleRef.current?.focus();
      } else {
        contactTitleRef.current?.focus();
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        (event.target instanceof Element &&
          event.target.closest(
            '[role="dialog"], [role="menu"], [role="listbox"]',
          ))
      )
        return;
      closePanel();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closePanel, isWide, panelKind, panelOpen, panelTargetKey]);

  return (
    <div
      className={`relative grid h-full min-h-0 min-w-0 ${panelOpen ? "xl:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]" : ""}`}
    >
      <MessageThread
        canSend={canSend}
        conversation={currentConversation}
        conversationId={conversationId}
        hasNextPage={hasNextPage}
        isContactPanelOpen={panelOpen && panelTarget?.kind === "contact"}
        isNotesPanelOpen={panelOpen && panelTarget?.kind === "notes"}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        isPending={isPending}
        messages={messages}
        onLoadMore={onLoadMore}
        onOpenContact={(contactId, identityId, trigger, fallback) => {
          returnFocusRef.current = trigger;
          if (
            panelTarget?.kind === "contact" &&
            panelTarget.contactId === contactId &&
            panelTarget.identityId === identityId
          ) {
            closePanel();
            return;
          }
          setSelectedAuthor(null);
          setNotesOpen(false);
          setSelectedContact(
            contactId === currentContact?.contactId &&
              identityId === currentContact.identityId
              ? null
              : {
                  conversationId,
                  userId: user?.id ?? null,
                  workspaceId,
                  target: {
                    kind: "contact",
                    contactId,
                    identityId,
                    name: fallback.name,
                    avatarUrl: fallback.avatarUrl,
                  },
                },
          );
          setContactPanelPreference(true);
          window.requestAnimationFrame(() => contactTitleRef.current?.focus());
        }}
        onOpenAuthor={(message, trigger) => {
          returnFocusRef.current = trigger;
          setNotesOpen(false);
          setSelectedAuthor({
            conversationId,
            userId: user?.id ?? null,
            workspaceId,
            target: {
              kind: "author",
              messageId: message.id,
              name: message.author_name ?? t("unknownParticipant"),
              avatarUrl: message.author_avatar_url,
            },
          });
        }}
        onToggleContactPanel={(trigger) => {
          returnFocusRef.current = trigger;
          setSelectedAuthor(null);
          setSelectedContact(null);
          setNotesOpen(false);
          const openingContact = panelTarget?.kind !== "contact";
          setContactPanelPreference(openingContact);
          if (openingContact) {
            window.requestAnimationFrame(() =>
              contactTitleRef.current?.focus(),
            );
          }
        }}
        onToggleConversationNotes={(trigger) => {
          returnFocusRef.current = trigger;
          setSelectedAuthor(null);
          setNotesOpen((open) => !open);
          if (!notesOpen) {
            window.requestAnimationFrame(() => notesTitleRef.current?.focus());
          }
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
              className="fixed inset-y-0 right-0 z-[61] w-[min(420px,calc(100vw-3rem))] outline-none"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                focusPanelTrigger();
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
