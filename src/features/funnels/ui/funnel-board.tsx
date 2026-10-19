import {
  DragDropProvider,
  KeyboardSensor,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDot,
  CircleHelp,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { contactDetailsPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import type { StatusRead } from "../api/funnels-api";
import type { InquirySummary } from "../api/inquiries-api";

type BoardProps = {
  statuses: StatusRead[];
  inquiries: InquirySummary[];
  inquiryCounts: Record<string, number> | null;
  inquiriesLoading: boolean;
  inquiriesFailed: boolean;
  hasMoreInquiries: boolean;
  loadingMoreInquiries: boolean;
  onLoadMoreInquiries: () => void;
  canEdit: boolean;
  busy: boolean;
  onEdit: (status: StatusRead) => void;
  onDelete: (status: StatusRead) => void;
  onMakeEntry: (status: StatusRead) => void;
  onReorder: (ids: string[]) => void;
  canMoveInquiries: boolean;
  canChangeInquiryState: boolean;
  onMoveInquiry: (inquiry: InquirySummary, status: StatusRead) => void;
  onChangeInquiryState: (inquiry: InquirySummary) => void;
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
  inquiries: InquirySummary[];
  inquiryCount: number | null;
  inquiriesLoading: boolean;
  inquiriesFailed: boolean;
  hasMoreInquiries: boolean;
  canEdit: boolean;
  canMoveInquiries: boolean;
  canChangeInquiryState: boolean;
  busy: boolean;
  onChangeInquiryState: (inquiry: InquirySummary) => void;
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

function InquiryCard({
  inquiry,
  canMove,
  canChangeState,
  busy,
  onChangeState,
}: {
  inquiry: InquirySummary;
  canMove: boolean;
  canChangeState: boolean;
  busy: boolean;
  onChangeState: () => void;
}) {
  const { t } = useTranslation("funnels");
  const contactName = inquiry.contact_name.trim() || t("unnamedContact");
  const isOpen = inquiry.state === "open";
  const actionCount = Number(canMove && isOpen) + Number(canChangeState);
  const actionPadding =
    actionCount === 2 ? "pr-16" : actionCount === 1 ? "pr-10" : "";
  const { ref, handleRef, isDragging } = useDraggable({
    id: `inquiry:${inquiry.id}`,
    type: "inquiry",
    data: { statusId: inquiry.status_id },
    disabled: !canMove || !isOpen || busy,
  });

  return (
    <div
      className={`relative rounded-xl border border-line bg-surface text-ink shadow-sm transition-colors hover:border-brand focus-within:border-brand motion-reduce:transition-none ${isDragging ? "opacity-50" : ""}`}
      ref={ref}
    >
      <Link
        className={`block rounded-xl p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${actionPadding}`}
        to={contactDetailsPath(inquiry.contact_id)}
      >
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand"
          >
            {Array.from(contactName)[0]?.toUpperCase() ?? "?"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold" title={contactName}>
              {contactName}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
              {inquiry.last_message_text?.trim() || t("noMessage")}
            </p>
            {!isOpen && (
              <span className="mt-2 inline-flex rounded-full bg-subtle px-2 py-0.5 text-[11px] font-medium text-muted">
                {t("closedInquiry")}
              </span>
            )}
          </div>
        </div>
      </Link>
      {canMove && isOpen && (
        <button
          aria-label={t("moveInquiry", { name: contactName })}
          className={`absolute top-2 ${canChangeState ? "right-9" : "right-1.5"} flex size-7 cursor-grab touch-none items-center justify-center rounded-lg text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none`}
          disabled={busy}
          ref={handleRef}
          type="button"
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </button>
      )}
      {canChangeState && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            aria-label={t("inquiryActions", { name: contactName })}
            className="absolute top-2 right-1.5 flex size-7 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
            disabled={busy}
            type="button"
          >
            <MoreHorizontal aria-hidden="true" className="size-4" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              className="z-40 min-w-48 rounded-xl border border-line bg-surface p-1 text-sm text-ink shadow-lg"
              sideOffset={5}
            >
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none data-highlighted:bg-brand-soft"
                onSelect={onChangeState}
              >
                {isOpen ? (
                  <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
                ) : (
                  <RotateCcw aria-hidden="true" className="size-4 shrink-0" />
                )}
                {t(isOpen ? "closeInquiry" : "reopenInquiry")}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
}

function StatusColumn({
  status,
  total,
  inquiries,
  inquiryCount,
  inquiriesLoading,
  inquiriesFailed,
  hasMoreInquiries,
  canEdit,
  canMoveInquiries,
  canChangeInquiryState,
  busy,
  onChangeInquiryState,
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
  const { ref: inquiryDropRef, isDropTarget: isInquiryDropTarget } =
    useDroppable({
      id: `status-drop:${status.id}`,
      accept: "inquiry",
      disabled: !canMoveInquiries || busy,
    });

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
            {inquiryCount ?? "—"}
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
      <div
        className={`min-h-0 flex-1 space-y-2 rounded-xl px-2 pt-5 transition-colors motion-reduce:transition-none ${isInquiryDropTarget ? "bg-[var(--column-soft)]" : ""}`}
        ref={inquiryDropRef}
      >
        {inquiries.map((inquiry) => (
          <InquiryCard
            busy={busy}
            canChangeState={canChangeInquiryState}
            canMove={canMoveInquiries}
            inquiry={inquiry}
            key={inquiry.id}
            onChangeState={() => onChangeInquiryState(inquiry)}
          />
        ))}
        {inquiries.length === 0 && (
          <p className="text-center text-xs leading-5 text-muted">
            {inquiriesLoading
              ? t("loadingInquiries")
              : inquiriesFailed
                ? t("inquiriesLoadError")
                : hasMoreInquiries && inquiryCount !== null && inquiryCount > 0
                  ? t("moreInquiriesInColumn")
                  : t("emptyColumn")}
          </p>
        )}
        <button
          aria-label={t("createAppeal")}
          className="flex h-9 w-full items-center justify-center gap-1 rounded-lg text-sm font-normal text-muted/70 transition-colors hover:bg-[var(--column-soft)] hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed motion-reduce:transition-none"
          disabled
          title={t("manualCreationUnavailable")}
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
    type: "status",
    accept: "status",
    group: "funnel-statuses",
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
  inquiries,
  inquiryCounts,
  inquiriesLoading,
  inquiriesFailed,
  hasMoreInquiries,
  loadingMoreInquiries,
  onLoadMoreInquiries,
  canEdit,
  busy,
  onEdit,
  onDelete,
  onMakeEntry,
  onReorder,
  canMoveInquiries,
  canChangeInquiryState,
  onMoveInquiry,
  onChangeInquiryState,
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
  const hasMovableInquiries =
    canMoveInquiries && inquiries.some((inquiry) => inquiry.state === "open");

  const inquiriesByStatus = new Map<string, InquirySummary[]>();
  for (const inquiry of inquiries) {
    const group = inquiriesByStatus.get(inquiry.status_id) ?? [];
    group.push(inquiry);
    inquiriesByStatus.set(inquiry.status_id, group);
  }

  function columnInquiries(statusId: string) {
    return inquiriesByStatus.get(statusId) ?? [];
  }

  function columnCount(statusId: string) {
    if (inquiryCounts) return inquiryCounts[statusId] ?? 0;
    return inquiriesLoading || inquiriesFailed
      ? null
      : columnInquiries(statusId).length;
  }

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
        {(canEdit && others.length > 1) || hasMovableInquiries ? (
          <div className="shrink-0 space-y-1 px-4 pt-4 text-xs text-muted sm:px-6 lg:px-8">
            {canEdit && others.length > 1 && <p>{t("dragHelp")}</p>}
            {hasMovableInquiries && <p>{t("dragInquiryHelp")}</p>}
          </div>
        ) : null}
        <DragDropProvider
          sensors={(defaults) => [
            ...defaults.filter((sensor) => sensor !== KeyboardSensor),
            KeyboardSensor.configure({ offset: { x: 312, y: 0 } }),
          ]}
          onDragEnd={(event) => {
            if (event.canceled) return;
            const { source, target } = event.operation;
            if (source?.type === "inquiry") {
              if (!canMoveInquiries || busy) return;
              const inquiry = inquiries.find(
                (item) => `inquiry:${item.id}` === source.id,
              );
              const status = statuses.find(
                (item) => `status-drop:${item.id}` === target?.id,
              );
              if (
                inquiry?.state === "open" &&
                status &&
                inquiry.status_id !== status.id
              ) {
                onMoveInquiry(inquiry, status);
              }
              return;
            }
            if (!isSortable(source)) return;
            finishDrag(source.initialIndex, source.index);
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
                  canMoveInquiries={canMoveInquiries}
                  canChangeInquiryState={canChangeInquiryState}
                  inquiries={columnInquiries(entry.id)}
                  inquiryCount={columnCount(entry.id)}
                  inquiriesLoading={inquiriesLoading}
                  inquiriesFailed={inquiriesFailed}
                  hasMoreInquiries={hasMoreInquiries}
                  onDelete={() => onDelete(entry)}
                  onEdit={() => onEdit(entry)}
                  onMakeEntry={() => onMakeEntry(entry)}
                  onChangeInquiryState={onChangeInquiryState}
                  status={entry}
                  total={statuses.length}
                />
              )}
              {others.map((status, index) => (
                <SortableStatusColumn
                  busy={busy}
                  canEdit={canEdit}
                  canMoveInquiries={canMoveInquiries}
                  canChangeInquiryState={canChangeInquiryState}
                  inquiries={columnInquiries(status.id)}
                  inquiryCount={columnCount(status.id)}
                  inquiriesLoading={inquiriesLoading}
                  inquiriesFailed={inquiriesFailed}
                  hasMoreInquiries={hasMoreInquiries}
                  index={index}
                  key={status.id}
                  onDelete={() => onDelete(status)}
                  onEdit={() => onEdit(status)}
                  onMakeEntry={() => onMakeEntry(status)}
                  onChangeInquiryState={onChangeInquiryState}
                  status={status}
                  total={statuses.length}
                />
              ))}
            </div>
          </div>
        </DragDropProvider>
        {hasMoreInquiries && (
          <div className="shrink-0 border-t border-line px-4 py-3 text-center sm:px-6 lg:px-8">
            <Button
              disabled={loadingMoreInquiries}
              onClick={onLoadMoreInquiries}
              size="sm"
              variant="outline"
            >
              {loadingMoreInquiries ? t("loadingInquiries") : t("loadMore")}
            </Button>
          </div>
        )}
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
