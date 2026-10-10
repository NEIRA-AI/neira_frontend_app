import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { messageConversationPath } from "@/shared/config/routes";

import { ChatAvatar } from "./chat-avatar";

export type ChatToast = {
  id: string;
  conversationId: string;
  avatarUrl: string | null;
  name: string;
  preview: string;
};

function truncate(value: string, maxLength: number) {
  const chars = Array.from(value.trim());
  return chars.length > maxLength
    ? `${chars.slice(0, maxLength).join("")}…`
    : value.trim();
}

export function MessageToast({
  toasts,
  onDismiss,
}: {
  toasts: ChatToast[];
  onDismiss: (id: string) => void;
}) {
  const { t } = useTranslation("chats");

  if (!toasts.length) return null;

  return (
    <div
      aria-label={t("newMessages")}
      className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
      role="region"
    >
      {toasts.map((toast) => (
        <div
          className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-surface p-3 shadow-xl"
          key={toast.id}
          role="status"
        >
          <Link
            aria-label={t("openConversation", { name: toast.name })}
            className="flex min-w-0 flex-1 items-start gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            onClick={() => onDismiss(toast.id)}
            to={messageConversationPath(toast.conversationId)}
          >
            <ChatAvatar name={toast.name} url={toast.avatarUrl} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">
                {toast.name}
              </span>
              <span className="mt-0.5 block break-words text-sm text-muted">
                {truncate(toast.preview, 140) || t("unsupportedMessage")}
              </span>
            </span>
          </Link>
          <button
            aria-label={t("dismissToast")}
            className="grid size-7 shrink-0 place-items-center rounded-md text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
            onClick={() => onDismiss(toast.id)}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
