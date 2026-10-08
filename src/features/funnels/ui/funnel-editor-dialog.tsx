import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import type { FunnelRead, StatusRead } from "../api/funnels-api";
import { useCreateFunnel } from "../model/use-create-funnel";
import { useUpdateFunnel } from "../model/use-update-funnel";
import { FunnelDialog } from "./funnel-dialog";
import { StatusColorPicker } from "./status-color-picker";

type StatusColor = StatusRead["color"];

type DraftStatus = {
  key: string;
  id?: string;
  name: string;
  description: string;
  color: StatusColor;
};

const defaultStatuses: Array<
  Pick<DraftStatus, "name" | "description" | "color">
> = [
  {
    name: "Новый: Квалификация",
    description: "Новые обращения проходят первичную квалификацию.",
    color: "blue",
  },
  {
    name: "Интерес",
    description: "Клиент проявил интерес; уточняем потребность.",
    color: "violet",
  },
  {
    name: "Целевой Лид",
    description: "Квалифицированное обращение с подтверждённой потребностью.",
    color: "amber",
  },
  {
    name: "Отказ",
    description: "Клиент отказался от дальнейшего общения.",
    color: "coral",
  },
  {
    name: "Спам",
    description: "Нежелательные или нерелевантные обращения.",
    color: "slate",
  },
];

function initialStatuses(): DraftStatus[] {
  return defaultStatuses.map((status, index) => ({
    key: String(index),
    ...status,
  }));
}

function statusesFromFunnel(funnel: FunnelRead): DraftStatus[] {
  return [...funnel.statuses]
    .sort((left, right) => left.position - right.position)
    .map((status) => ({
      key: status.id,
      id: status.id,
      name: status.name,
      description: status.description ?? "",
      color: status.color,
    }));
}

export function FunnelEditorDialog({
  workspaceId,
  funnel,
  onClose,
  onSaved,
}: {
  workspaceId: string;
  funnel?: FunnelRead;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { t } = useTranslation("funnels");
  const create = useCreateFunnel(workspaceId);
  const update = useUpdateFunnel(workspaceId);
  const [name, setName] = useState(() => funnel?.name ?? "");
  const [statuses, setStatuses] = useState(() =>
    funnel ? statusesFromFunnel(funnel) : initialStatuses(),
  );
  const [submitted, setSubmitted] = useState(false);
  const busy = create.isPending || update.isPending;
  const failed = funnel ? update.isError : create.isError;

  const validName = name.trim().length > 0;
  const validStatuses =
    statuses.length > 0 && statuses.every((status) => status.name.trim());

  function changeStatus(key: string, patch: Partial<DraftStatus>) {
    setStatuses((current) =>
      current.map((status) =>
        status.key === key ? { ...status, ...patch } : status,
      ),
    );
  }

  function moveStatus(from: number, to: number) {
    if (to < 0 || to >= statuses.length) return;
    setStatuses((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      if (!item) return current;
      next.splice(to, 0, item);
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!validName || !validStatuses || busy) return;
    try {
      const changes = {
        name: name.trim(),
        statuses: statuses.map((status) => ({
          ...(status.id ? { id: status.id } : {}),
          name: status.name.trim(),
          description: status.description.trim() || null,
          color: status.color,
        })),
      };
      const saved = funnel
        ? await update.mutateAsync({ id: funnel.id, ...changes })
        : await create.mutateAsync(changes);
      onSaved(saved.id);
    } catch {
      // The request error is shown below the form.
    }
  }

  return (
    <FunnelDialog
      busy={busy}
      description={
        funnel ? t("configureFunnelDescription") : t("createFunnelDescription")
      }
      onClose={onClose}
      title={funnel ? t("configureFunnelTitle") : t("createFunnelTitle")}
      wide
    >
      <form className="mt-6 space-y-6" noValidate onSubmit={submit}>
        <div>
          <label
            className="mb-2 block text-sm font-semibold"
            htmlFor="funnel-name"
          >
            {t("name")}
          </label>
          <Input
            aria-invalid={submitted && !validName}
            autoFocus
            disabled={busy}
            id="funnel-name"
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("funnelNamePlaceholder")}
            value={name}
          />
          {submitted && !validName && (
            <p className="mt-2 text-sm text-danger" role="alert">
              {t("nameRequired")}
            </p>
          )}
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">{t("statuses")}</h3>
            <span className="text-xs text-muted">
              {t("statusCount", { count: statuses.length })}
            </span>
          </div>
          <div className="space-y-3">
            {statuses.map((status, index) => (
              <div
                className="rounded-xl border border-line bg-page/40 p-3 sm:p-4"
                key={status.key}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-xs font-semibold text-muted">
                    <span className="flex size-6 items-center justify-center rounded-md bg-subtle text-ink">
                      {index + 1}
                    </span>
                    {index === 0 && (
                      <span className="rounded-full bg-brand-soft px-2 py-1 text-brand-strong">
                        {t("entry")}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    {index > 0 && (
                      <button
                        className="rounded-lg px-2 py-1 text-xs text-brand-strong hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
                        disabled={busy}
                        onClick={() => moveStatus(index, 0)}
                        type="button"
                      >
                        {t("makeEntry")}
                      </button>
                    )}
                    {index > 1 && (
                      <button
                        aria-label={
                          t("moveStatus", { name: status.name }) + " ↑"
                        }
                        className="rounded-lg p-1.5 text-muted hover:bg-subtle"
                        disabled={busy}
                        onClick={() => moveStatus(index, index - 1)}
                        type="button"
                      >
                        <ArrowUp aria-hidden="true" className="size-4" />
                      </button>
                    )}
                    {index > 0 && index < statuses.length - 1 && (
                      <button
                        aria-label={
                          t("moveStatus", { name: status.name }) + " ↓"
                        }
                        className="rounded-lg p-1.5 text-muted hover:bg-subtle"
                        disabled={busy}
                        onClick={() => moveStatus(index, index + 1)}
                        type="button"
                      >
                        <ArrowDown aria-hidden="true" className="size-4" />
                      </button>
                    )}
                    <button
                      aria-label={t("removeDraftStatus")}
                      className="rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger disabled:opacity-40"
                      disabled={busy || statuses.length === 1}
                      onClick={() =>
                        setStatuses((current) =>
                          current.filter((item) => item.key !== status.key),
                        )
                      }
                      title={
                        statuses.length === 1
                          ? t("minStatus")
                          : t("removeDraftStatus")
                      }
                      type="button"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                  <Input
                    aria-label={`${t("name")} ${index + 1}`}
                    aria-invalid={submitted && !status.name.trim()}
                    className="min-h-10"
                    disabled={busy}
                    maxLength={120}
                    onChange={(event) =>
                      changeStatus(status.key, { name: event.target.value })
                    }
                    placeholder={t("statusNamePlaceholder")}
                    value={status.name}
                  />
                  <Input
                    aria-label={`${t("description")} ${index + 1}`}
                    className="min-h-10"
                    disabled={busy}
                    maxLength={1000}
                    onChange={(event) =>
                      changeStatus(status.key, {
                        description: event.target.value,
                      })
                    }
                    placeholder={t("statusDescriptionPlaceholder")}
                    value={status.description}
                  />
                </div>
                <details className="group mt-3">
                  <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-lg px-1 py-1 text-xs font-medium text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
                    <span
                      aria-hidden="true"
                      className="size-4 rounded-full border border-ink/10"
                      style={{
                        backgroundColor: `var(--funnel-${status.color})`,
                      }}
                    />
                    {t("color")}
                    <ChevronDown
                      aria-hidden="true"
                      className="size-3.5 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="pt-3">
                    <StatusColorPicker
                      compact
                      disabled={busy}
                      name={`draft-status-color-${status.key}`}
                      onChange={(color) => changeStatus(status.key, { color })}
                      value={status.color}
                    />
                  </div>
                </details>
              </div>
            ))}
          </div>
          {submitted && !validStatuses && (
            <p className="mt-2 text-sm text-danger" role="alert">
              {t("statusNameRequired")}
            </p>
          )}
          <Button
            className="mt-3"
            disabled={busy}
            onClick={() =>
              setStatuses((current) => [
                ...current,
                {
                  key: crypto.randomUUID(),
                  name: "",
                  description: "",
                  color: "violet",
                },
              ])
            }
            size="sm"
            variant="secondary"
          >
            <Plus aria-hidden="true" className="size-4" />
            {t("addAnotherStatus")}
          </Button>
        </div>
        {failed && (
          <p className="text-sm text-danger" role="alert">
            {t("actionError")}
          </p>
        )}
        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <Button disabled={busy} onClick={onClose} variant="ghost">
            {t("cancel")}
          </Button>
          <Button disabled={busy} type="submit">
            {t(funnel ? "save" : "create")}
          </Button>
        </div>
      </form>
    </FunnelDialog>
  );
}
