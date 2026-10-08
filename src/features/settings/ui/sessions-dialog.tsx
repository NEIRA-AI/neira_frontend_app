import * as Dialog from "@radix-ui/react-dialog";
import { Laptop, Monitor, Smartphone, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";

import type { SessionSummary } from "../api/sessions-api";

type SessionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: SessionSummary[];
  loading: boolean;
  busy: boolean;
  error: "load" | "refresh" | "action" | null;
  onRevoke: (id: string) => void;
  onRevokeOthers: () => void;
};

const errorMessageKeys = {
  load: "sessionsLoadError",
  refresh: "sessionsRefreshError",
  action: "sessionsActionError",
} as const;

function deviceName(userAgent: string | null, fallback: string) {
  if (!userAgent) return fallback;

  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Firefox\//.test(userAgent)
      ? "Firefox"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : fallback;
  const device = /iPhone|iPad/.test(userAgent)
    ? "iPhone / iPad"
    : /Android/.test(userAgent)
      ? "Android"
      : /Macintosh|Mac OS X/.test(userAgent)
        ? "macOS"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Linux/.test(userAgent)
            ? "Linux"
            : null;

  return device ? `${browser} · ${device}` : browser;
}

function SessionIcon({ userAgent }: { userAgent: string | null }) {
  const Icon = /iPhone|iPad|Android/.test(userAgent ?? "")
    ? Smartphone
    : /Macintosh|Mac OS X|Windows|Linux/.test(userAgent ?? "")
      ? Laptop
      : Monitor;

  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
      <Icon aria-hidden="true" className="size-5" />
    </span>
  );
}

export function SessionsDialog({
  open,
  onOpenChange,
  sessions,
  loading,
  busy,
  error,
  onRevoke,
  onRevokeOthers,
}: SessionsDialogProps) {
  const { t, i18n } = useTranslation("settings");
  const [confirmOthers, setConfirmOthers] = useState(false);
  const current = sessions.find((session) => session.current);
  const others = sessions.filter((session) => !session.current);
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  function close(nextOpen: boolean) {
    if (!nextOpen) setConfirmOthers(false);
    onOpenChange(nextOpen);
  }

  function sessionRow(session: SessionSummary) {
    const name = deviceName(session.user_agent, t("unknownDevice"));
    const seenAt = new Date(session.last_seen_at);

    return (
      <li key={session.id} className="flex min-w-0 items-start gap-3 py-4">
        <SessionIcon userAgent={session.user_agent} />
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold text-ink">{name}</p>
          <p className="mt-1 text-xs text-muted">
            {session.current
              ? t("thisDevice")
              : `${t("lastActive")}: ${Number.isNaN(seenAt.getTime()) ? "—" : dateFormat.format(seenAt)}`}
          </p>
        </div>
        {!session.current && (
          <button
            aria-label={`${t("revokeSession")}: ${name}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
            disabled={busy}
            onClick={() => onRevoke(session.id)}
            title={t("revokeSession")}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </li>
    );
  }

  return (
    <Dialog.Root onOpenChange={close} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-7">
          <Dialog.Title className="pr-10 text-xl font-semibold">
            {t("activeSessions")}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-5 text-muted">
            {t("sessionsDescription")}
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              aria-label={t("closeDialog")}
              className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:right-7 sm:top-7"
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </Dialog.Close>

          {error && (
            <p
              className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {t(errorMessageKeys[error])}
            </p>
          )}

          {loading ? (
            <p className="py-12 text-center text-sm text-muted" role="status">
              {t("loadingSessions")}
            </p>
          ) : error !== "load" ? (
            <div className="mt-6">
              {current && (
                <section aria-label={t("thisDevice")}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-brand">
                    {t("thisDevice")}
                  </h3>
                  <ul className="divide-y divide-line">
                    {sessionRow(current)}
                  </ul>
                </section>
              )}

              <section
                aria-label={t("otherSessions")}
                className={current ? "mt-5 border-t border-line pt-5" : ""}
              >
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {t("otherSessions")}
                </h3>
                {others.length ? (
                  <ul className="divide-y divide-line">
                    {others.map(sessionRow)}
                  </ul>
                ) : (
                  <p className="py-5 text-sm text-muted">
                    {t("noOtherSessions")}
                  </p>
                )}
              </section>

              {others.length > 0 && (
                <div className="border-t border-line pt-5">
                  {confirmOthers ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="w-full text-sm text-ink">
                        {t("confirmRevokeOthers")}
                      </p>
                      <Button
                        disabled={busy}
                        onClick={() => {
                          onRevokeOthers();
                          setConfirmOthers(false);
                        }}
                        size="sm"
                        variant="danger"
                      >
                        {t("revokeOthers")}
                      </Button>
                      <Button
                        disabled={busy}
                        onClick={() => setConfirmOthers(false)}
                        size="sm"
                        variant="ghost"
                      >
                        {t("cancel")}
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="text-sm font-semibold text-danger hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      disabled={busy}
                      onClick={() => setConfirmOthers(true)}
                      type="button"
                    >
                      {t("revokeOthers")}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
