import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, Search, X } from "lucide-react";
import axios from "axios";
import { useEffect, useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import {
  impersonationUsersQueryKey,
  type ImpersonationTarget,
} from "../api/impersonation-api";
import { useAuthorizeImpersonation } from "../model/use-authorize-impersonation";
import { useImpersonationUsers } from "../model/use-impersonation-users";

type FormError =
  | "passwordRequired"
  | "passwordIncorrect"
  | "passwordTooMany"
  | "passwordError"
  | "authorizationExpired"
  | "startError"
  | "userUnavailable"
  | null;

type ImpersonationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function TargetAvatar({ target }: { target: ImpersonationTarget }) {
  const initial = Array.from(target.name.trim() || target.email)[0];
  return (
    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft text-sm font-semibold text-brand">
      {target.avatar_url ? (
        <img
          alt=""
          className="size-full object-cover"
          src={target.avatar_url}
        />
      ) : (
        (initial?.toLocaleUpperCase() ?? "?")
      )}
    </span>
  );
}

function ImpersonationDialogContent({
  open,
  onOpenChange,
}: ImpersonationDialogProps) {
  const { t } = useTranslation("impersonation");
  const { startImpersonation } = useAuth();
  const queryClient = useQueryClient();
  const passwordId = useId();
  const searchId = useId();
  const [stage, setStage] = useState<"password" | "users">("password");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState<FormError>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const authorize = useAuthorizeImpersonation();
  const users = useImpersonationUsers(
    debouncedSearch,
    open && stage === "users",
  );
  const busy = authorize.isPending || startingId !== null;
  const pages = users.data?.pages ?? [];
  const targets = pages.flatMap((page) => page.users);
  const total = pages.at(-1)?.total ?? 0;

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      250,
    );
    return () => window.clearTimeout(timeout);
  }, [search]);

  function close(nextOpen: boolean) {
    if (busy) return;
    if (!nextOpen) {
      queryClient.removeQueries({
        queryKey: impersonationUsersQueryKey().slice(0, 3),
      });
    }
    onOpenChange(nextOpen);
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!password) {
      setError("passwordRequired");
      return;
    }
    setError(null);
    try {
      await authorize.mutateAsync(password);
      setPassword("");
      queryClient.removeQueries({
        queryKey: impersonationUsersQueryKey().slice(0, 3),
      });
      setStage("users");
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        if (requestError.response?.status === 400) {
          setError("passwordIncorrect");
          return;
        }
        if (requestError.response?.status === 429) {
          setError("passwordTooMany");
          return;
        }
      }
      setError("passwordError");
    }
  }

  async function enterAs(target: ImpersonationTarget) {
    if (busy) return;
    setStartingId(target.id);
    setError(null);
    try {
      await startImpersonation(target.id);
      onOpenChange(false);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        if (requestError.response?.status === 403) {
          setStage("password");
          setError("authorizationExpired");
        } else if (requestError.response?.status === 404) {
          setError("userUnavailable");
          void users.refetch();
        } else {
          setError("startError");
        }
      } else {
        setError("startError");
      }
    } finally {
      setStartingId(null);
    }
  }

  return (
    <Dialog.Root onOpenChange={close} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-surface p-5 text-ink shadow-xl outline-none sm:p-7"
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-semibold leading-tight">
                {t("dialogTitle")}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-5 text-muted">
                {t(
                  stage === "password"
                    ? "passwordDescription"
                    : "usersDescription",
                )}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label={t("close")}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                disabled={busy}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </Dialog.Close>
          </div>

          {stage === "password" ? (
            <form
              className="mt-6 space-y-4"
              noValidate
              onSubmit={submitPassword}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor={passwordId}>
                  {t("passwordLabel")}
                </label>
                <Input
                  aria-invalid={Boolean(
                    error && error !== "authorizationExpired",
                  )}
                  autoComplete="current-password"
                  autoFocus
                  disabled={busy}
                  id={passwordId}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                  }}
                  placeholder={t("passwordPlaceholder")}
                  type="password"
                  value={password}
                />
              </div>
              {error && (
                <p className="text-sm text-danger" role="alert">
                  {t(error)}
                </p>
              )}
              <div className="flex justify-end">
                <Button disabled={busy} type="submit">
                  {t("continue")}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-6 min-h-0 flex flex-col">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                />
                <label className="sr-only" htmlFor={searchId}>
                  {t("usersSearch")}
                </label>
                <Input
                  autoFocus
                  id={searchId}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("usersSearch")}
                  className="pl-10"
                  value={search}
                />
              </div>

              <div className="mt-4 min-h-0 overflow-y-auto rounded-xl border border-line">
                {users.isPending ? (
                  <p className="px-4 py-6 text-sm text-muted">
                    {t("usersLoading")}
                  </p>
                ) : users.isError ? (
                  <div className="space-y-3 px-4 py-6">
                    <p className="text-sm text-danger" role="alert">
                      {axios.isAxiosError(users.error) &&
                      users.error.response?.status === 403
                        ? t("authorizationExpired")
                        : t("usersError")}
                    </p>
                    <Button
                      onClick={() => {
                        if (
                          axios.isAxiosError(users.error) &&
                          users.error.response?.status === 403
                        ) {
                          setStage("password");
                          setError("authorizationExpired");
                        } else {
                          void users.refetch();
                        }
                      }}
                      size="sm"
                      variant="outline"
                    >
                      {t("usersRetry")}
                    </Button>
                  </div>
                ) : targets.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted">
                    {t("usersEmpty")}
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {targets.map((target) => (
                      <li key={target.id}>
                        <button
                          className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand disabled:opacity-60"
                          disabled={busy}
                          onClick={() => void enterAs(target)}
                          type="button"
                        >
                          <TargetAvatar target={target} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {target.name.trim() || target.email}
                            </span>
                            <span className="block truncate text-xs text-muted">
                              {target.email}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-medium text-brand">
                            {startingId === target.id ? "…" : t("userEnter")}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {targets.length > 0 && (
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
                  <span>
                    {t("usersShowing", { count: targets.length, total })}
                  </span>
                  {users.hasNextPage && (
                    <Button
                      disabled={users.isFetchingNextPage || busy}
                      onClick={() => void users.fetchNextPage()}
                      size="sm"
                      variant="ghost"
                    >
                      {t("usersMore")}
                    </Button>
                  )}
                </div>
              )}
              {error && (
                <p className="mt-3 text-sm text-danger" role="alert">
                  {t(error)}
                </p>
              )}
              <div className="mt-4">
                <Button
                  disabled={busy}
                  onClick={() => {
                    setStage("password");
                    setError(null);
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  {t("back")}
                </Button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ImpersonationDialog(props: ImpersonationDialogProps) {
  return (
    <ImpersonationDialogContent
      key={props.open ? "open" : "closed"}
      {...props}
    />
  );
}
