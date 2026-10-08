import { DragDropProvider, KeyboardSensor } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  CircleHelp,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { StatusRead } from "../api/funnels-api";

type BoardProps = {
  statuses: StatusRead[];
  canEdit: boolean;
  busy: boolean;
  onEdit: (status: StatusRead) => void;
  onDelete: (status: StatusRead) => void;
  onMakeEntry: (status: StatusRead) => void;
  onReorder: (ids: string[]) => void;
};

function statusColorStyle(status: StatusRead): CSSProperties {
  return {
    "--column-accent": `var(--funnel-${status.color})`,
    "--column-soft": `var(--funnel-${status.color}-soft)`,
  } as CSSProperties;
}

function StatusActions({
  status,
  canDelete,
  onEdit,
  onDelete,
  onMakeEntry,
}: {
  status: StatusRead;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMakeEntry: () => void;
}) {
  const { t } = useTranslation("funnels");
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={`${status.name}: ${t("statuses")}`}
        className="pointer-events-auto flex size-6 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        type="button"
      >
        <MoreHorizontal aria-hidden="true" className="size-5" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-40 min-w-48 rounded-xl border border-line bg-surface p-1 text-sm text-ink shadow-lg"
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none data-highlighted:bg-brand-soft"
            onSelect={onEdit}
          >
            <Pencil aria-hidden="true" className="size-4 shrink-0" />
            {t("editAction")}
          </DropdownMenu.Item>
          {!status.is_entry && (
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none data-highlighted:bg-brand-soft"
              onSelect={onMakeEntry}
            >
              <ArrowDownToLine aria-hidden="true" className="size-4 shrink-0" />
              {t("makeEntry")}
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-danger outline-none data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-danger-soft"
            disabled={!canDelete}
            onSelect={onDelete}
            title={
              !canDelete && status.is_entry ? t("cannotDeleteEntry") : undefined
            }
          >
            <Trash2 aria-hidden="true" className="size-4 shrink-0" />
            {t("delete")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

type ColumnProps = {
  status: StatusRead;
  total: number;
  canEdit: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMakeEntry: () => void;
};

function ColumnHint({
  label,
  content,
  icon,
}: {
  label: string;
  content: string;
  icon: ReactNode;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          aria-label={label}
          className="pointer-events-auto flex size-5 shrink-0 items-center justify-center rounded-full text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          type="button"
        >
          {icon}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 max-w-60 rounded-xl border border-line bg-surface px-3 py-2 text-xs leading-5 text-ink shadow-lg"
          collisionPadding={8}
          side="bottom"
          sideOffset={7}
        >
          {content}
          <Tooltip.Arrow className="fill-surface" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function StatusColumn({
  status,
  total,
  canEdit,
  busy,
  onEdit,
  onDelete,
  onMakeEntry,
  containerRef,
  handleRef,
  isDragging = false,
  isDropTarget = false,
}: ColumnProps & {
  containerRef?: (element: Element | null) => void;
  handleRef?: (element: Element | null) => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
}) {
  const { t } = useTranslation("funnels");
  const draggable = canEdit && !status.is_entry && !busy;

  return (
    <section
      aria-label={status.name}
      className={`relative flex w-[300px] shrink-0 self-stretch flex-col border-r border-dashed border-line pr-3 ${isDropTarget ? "bg-brand-soft/40" : ""} ${isDragging ? "opacity-70" : ""}`}
      ref={containerRef}
      style={statusColorStyle(status)}
    >
      <header className="relative flex h-11 shrink-0 flex-col justify-center rounded-xl border-t-[3px] border-[var(--column-accent)] bg-[var(--column-soft)] px-2.5 py-2">
        {draggable && (
          <button
            aria-label={t("moveStatus", { name: status.name })}
            className="absolute inset-0 cursor-grab touch-none rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:cursor-grabbing"
            ref={handleRef}
            type="button"
          />
        )}
        <div className="pointer-events-none relative z-10 flex min-w-0 items-center gap-1.5">
          <h2 className="flex min-w-0 flex-1 items-center gap-1 text-sm font-semibold leading-5 text-ink">
            {status.is_entry && (
              <ColumnHint
                content={t("entryHelp")}
                icon={
                  <CircleDot
                    aria-hidden="true"
                    className="size-4 text-[var(--column-accent)]"
                  />
                }
                label={t("entry")}
              />
            )}
            <span className="min-w-0 truncate" title={status.name}>
              {status.name}
            </span>
            <ColumnHint
              content={status.description || t("noDescription")}
              icon={<CircleHelp aria-hidden="true" className="size-3.5" />}
              label={t("description")}
            />
          </h2>
          <span className="inline-flex min-w-6 shrink-0 items-center justify-center rounded-full bg-surface/80 px-1.5 text-xs font-semibold leading-6 text-ink">
            0
          </span>
          {canEdit && (
            <StatusActions
              canDelete={!busy && total > 1 && !status.is_entry}
              onDelete={onDelete}
              onEdit={onEdit}
              onMakeEntry={onMakeEntry}
              status={status}
            />
          )}
        </div>
      </header>
      <div className="min-h-0 flex-1 px-2 pt-5 text-center">
        <p className="text-xs leading-5 text-muted">{t("emptyColumn")}</p>
        <button
          aria-label={t("createAppeal")}
          className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-lg text-sm font-normal text-muted/70 transition-colors hover:bg-[var(--column-soft)] hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed motion-reduce:transition-none"
          disabled
          title={t("availableWithAppeals")}
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" />
          {t("create")}
        </button>
      </div>
    </section>
  );
}

function SortableStatusColumn({
  index,
  ...props
}: ColumnProps & { index: number }) {
  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: props.status.id,
    index,
    disabled: !props.canEdit || props.busy,
  });
  return (
    <StatusColumn
      {...props}
      containerRef={ref}
      handleRef={handleRef}
      isDragging={isDragging}
      isDropTarget={isDropTarget}
    />
  );
}

export function FunnelBoard({
  statuses,
  canEdit,
  busy,
  onEdit,
  onDelete,
  onMakeEntry,
  onReorder,
}: BoardProps) {
  const { t } = useTranslation("funnels");
  const scrollId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const entry = statuses.find((status) => status.is_entry);
  const others = statuses
    .filter((status) => !status.is_entry)
    .sort((a, b) => a.position - b.position);

  const updateScrollButtons = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 2);
    setCanScrollRight(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
    );
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    updateScrollButtons();
    element.addEventListener("scroll", updateScrollButtons, { passive: true });

    const observer = new ResizeObserver(updateScrollButtons);
    observer.observe(element);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => {
      element.removeEventListener("scroll", updateScrollButtons);
      observer.disconnect();
    };
  }, [statuses.length, updateScrollButtons]);

  function scroll(direction: -1 | 1) {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollBy({
      left: direction * Math.max(260, Math.round(element.clientWidth * 0.7)),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  function finishDrag(from: number, to: number) {
    if (
      from < 0 ||
      to < 0 ||
      from >= others.length ||
      to >= others.length ||
      from === to
    )
      return;
    const next = [...others];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    onReorder([
      ...(entry ? [entry.id] : []),
      ...next.map((status) => status.id),
    ]);
  }

  return (
    <Tooltip.Provider delayDuration={250} skipDelayDuration={150}>
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div aria-hidden="true" className="shrink-0 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-line" />
        </div>
        {canEdit && others.length > 1 && (
          <p className="shrink-0 px-4 pt-4 text-xs text-muted sm:px-6 lg:px-8">
            {t("dragHelp")}
          </p>
        )}
        <DragDropProvider
          sensors={(defaults) => [
            ...defaults.filter((sensor) => sensor !== KeyboardSensor),
            KeyboardSensor.configure({ offset: { x: 312, y: 0 } }),
          ]}
          onDragEnd={(event) => {
            if (event.canceled || !isSortable(event.operation.source)) return;
            finishDrag(
              event.operation.source.initialIndex,
              event.operation.source.index,
            );
          }}
        >
          <div
            aria-label={t("statuses")}
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto overscroll-x-contain px-4 pb-4 pt-4 sm:px-6 lg:px-8"
            id={scrollId}
            ref={scrollRef}
            tabIndex={0}
          >
            <div
              className="flex h-full min-h-80 w-max min-w-full flex-1 gap-3"
              ref={contentRef}
            >
              {entry && (
                <StatusColumn
                  busy={busy}
                  canEdit={canEdit}
                  onDelete={() => onDelete(entry)}
                  onEdit={() => onEdit(entry)}
                  onMakeEntry={() => onMakeEntry(entry)}
                  status={entry}
                  total={statuses.length}
                />
              )}
              {others.map((status, index) => (
                <SortableStatusColumn
                  busy={busy}
                  canEdit={canEdit}
                  index={index}
                  key={status.id}
                  onDelete={() => onDelete(status)}
                  onEdit={() => onEdit(status)}
                  onMakeEntry={() => onMakeEntry(status)}
                  status={status}
                  total={statuses.length}
                />
              ))}
            </div>
          </div>
        </DragDropProvider>
        {canScrollLeft && (
          <button
            aria-controls={scrollId}
            aria-label={t("scrollLeft")}
            className="absolute top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/85 text-ink shadow-md transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none"
            onClick={() => scroll(-1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            aria-controls={scrollId}
            aria-label={t("scrollRight")}
            className="absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/85 text-ink shadow-md transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none"
            onClick={() => scroll(1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        )}
      </div>
    </Tooltip.Provider>
  );
}
