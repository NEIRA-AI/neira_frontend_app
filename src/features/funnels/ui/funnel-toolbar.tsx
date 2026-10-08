import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Columns3,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Table2,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Select } from "@/shared/ui/select";

import type { FunnelRead } from "../api/funnels-api";

export function FunnelToolbar({
  funnels,
  funnel,
  canEdit,
  onSelect,
  onCreateFunnel,
  onConfigureFunnel,
  onDeleteFunnel,
}: {
  funnels: FunnelRead[];
  funnel: FunnelRead;
  canEdit: boolean;
  onSelect: (id: string) => void;
  onCreateFunnel: () => void;
  onConfigureFunnel: () => void;
  onDeleteFunnel: () => void;
}) {
  const { t } = useTranslation("funnels");

  return (
    <div className="shrink-0 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex w-full min-w-0 items-center sm:w-auto">
          <Select
            ariaLabel={t("funnel")}
            className="min-w-0 flex-1 truncate font-semibold sm:w-[280px] sm:flex-none"
            onValueChange={onSelect}
            options={funnels.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            value={funnel.id}
          />
        </div>
        <div className="flex-1" />
        {canEdit && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              aria-label={`${funnel.name}: ${t("configureFunnel")}`}
              className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              type="button"
            >
              <Settings aria-hidden="true" className="size-5" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="z-40 min-w-52 rounded-xl border border-line bg-surface p-1 text-sm text-ink shadow-lg"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none data-highlighted:bg-brand-soft"
                  onSelect={onCreateFunnel}
                >
                  <Plus aria-hidden="true" className="size-4 shrink-0" />
                  {t("createFunnel")}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none data-highlighted:bg-brand-soft"
                  onSelect={onConfigureFunnel}
                >
                  <SlidersHorizontal
                    aria-hidden="true"
                    className="size-4 shrink-0"
                  />
                  {t("configureFunnel")}
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-line" />
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-danger outline-none data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-danger-soft"
                  disabled={funnels.length <= 1}
                  onSelect={onDeleteFunnel}
                  title={
                    funnels.length <= 1 ? t("deleteLastFunnel") : undefined
                  }
                >
                  <Trash2 aria-hidden="true" className="size-4 shrink-0" />
                  {t("deleteFunnel")}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div
          aria-label={`${t("kanbanView")} / ${t("tableView")}`}
          className="inline-flex items-center rounded-xl bg-subtle p-1"
          role="group"
        >
          <button
            aria-pressed="true"
            className="flex h-8 items-center gap-2 rounded-lg bg-surface px-3 text-sm font-medium text-ink shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            type="button"
          >
            <Columns3 aria-hidden="true" className="size-4" />
            {t("kanbanView")}
          </button>
          <span title={t("availableWithAppeals")}>
            <button
              className="flex h-8 cursor-not-allowed items-center gap-2 rounded-lg px-3 text-sm text-muted opacity-60"
              disabled
              type="button"
            >
              <Table2 aria-hidden="true" className="size-4" />
              {t("tableView")}
            </button>
          </span>
        </div>
        <div className="relative ml-auto w-full sm:w-72 lg:w-96">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          />
          <input
            aria-label={t("searchAppeals")}
            className="h-9 w-full cursor-not-allowed rounded-xl border border-line bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-muted/70"
            placeholder={t("searchAppeals")}
            readOnly
            title={t("availableWithAppeals")}
          />
        </div>
      </div>
    </div>
  );
}
