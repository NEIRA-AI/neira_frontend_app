import { ChevronDown, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import {
  channelEventsQueryKey,
  type ChannelEvent,
} from "../api/channel-events-api";
import {
  useChannelEventDetail,
  useChannelEvents,
} from "../model/use-channel-events";

function eventStatusTone(status: string) {
  switch (status) {
    case "processed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    default:
      return "neutral";
  }
}

function EventDetails({
  channelId,
  event,
  workspaceId,
}: {
  channelId: string;
  event: ChannelEvent;
  workspaceId: string;
}) {
  const { t } = useTranslation("channels");
  const query = useChannelEventDetail(workspaceId, channelId, event.id, true);

  return (
    <div className="border-t border-line px-4 py-4 sm:px-5">
      <dl className="grid gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted">{t("traceProviderEventId")}</dt>
          <dd className="mt-1 break-all font-mono text-ink">
            {event.provider_event_id ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">{t("traceEventId")}</dt>
          <dd className="mt-1 break-all font-mono text-ink">{event.id}</dd>
        </div>
        <div>
          <dt className="text-muted">{t("traceConnectionId")}</dt>
          <dd className="mt-1 break-all font-mono text-ink">
            {event.connection_id ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">{t("traceFunnelAtReceipt")}</dt>
          <dd className="mt-1 break-all font-mono text-ink">
            {event.funnel_id_at_receipt ?? "—"}
          </dd>
        </div>
      </dl>
      <h4 className="mt-5 text-sm font-semibold text-ink">
        {t("tracePayload")}
      </h4>
      {query.isPending ? (
        <p className="mt-3 text-sm text-muted" role="status">
          {t("tracePayloadLoading")}
        </p>
      ) : query.isError ? (
        <div className="mt-3 flex flex-wrap items-center gap-3" role="alert">
          <p className="text-sm text-danger">{t("tracePayloadError")}</p>
          <Button
            onClick={() => void query.refetch()}
            size="sm"
            variant="outline"
          >
            {t("retry")}
          </Button>
        </div>
      ) : (
        <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-subtle p-4 font-mono text-xs leading-5 whitespace-pre-wrap break-all text-ink">
          {JSON.stringify(query.data.payload, null, 2)}
        </pre>
      )}
    </div>
  );
}

function EventRow({
  channelId,
  event,
  expanded,
  onToggle,
  workspaceId,
}: {
  channelId: string;
  event: ChannelEvent;
  expanded: boolean;
  onToggle: () => void;
  workspaceId: string;
}) {
  const { t, i18n } = useTranslation("channels");
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
  const formatDate = (date: string) => dateFormat.format(new Date(date));
  const detailId = `channel-event-${event.id}-detail`;
  const statusLabel =
    event.processing_status === "pending" && event.next_attempt_at
      ? t("traceStatusRetry")
      : t(`traceStatus${event.processing_status}`, {
          defaultValue: event.processing_status,
        });

  return (
    <li className="overflow-hidden rounded-xl border border-line bg-surface">
      <button
        aria-controls={detailId}
        aria-expanded={expanded}
        className="relative grid w-full grid-cols-1 items-center gap-x-3 gap-y-3 px-4 py-4 pr-10 text-left transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto_auto] sm:px-5"
        onClick={onToggle}
        type="button"
      >
        <span className="min-w-0">
          <span className="block text-xs text-muted">
            {t("traceReceivedAt")}
          </span>
          <time
            className="mt-1 block text-sm font-medium text-ink"
            dateTime={event.received_at}
          >
            {formatDate(event.received_at)}
          </time>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`absolute right-4 top-4 size-4 text-muted transition-transform sm:static sm:col-start-4 sm:row-start-1 ${expanded ? "rotate-180" : ""}`}
        />
        <span className="min-w-0 sm:col-start-2 sm:row-start-1">
          <span className="block text-xs text-muted">{t("traceType")}</span>
          <span className="mt-1 block break-all font-mono text-sm text-ink">
            {event.event_type}
          </span>
        </span>
        <span className="min-w-0 sm:col-start-3 sm:row-start-1">
          <span className="block text-xs text-muted">{t("traceStatus")}</span>
          <Badge
            className="mt-1"
            tone={eventStatusTone(event.processing_status)}
          >
            {statusLabel}
          </Badge>
        </span>
      </button>
      <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line px-4 py-2 text-xs text-muted sm:px-5">
        <span>{t("traceAttempts", { count: event.attempt_count })}</span>
        {event.processed_at && (
          <span>
            {t("traceProcessedAt", { date: formatDate(event.processed_at) })}
          </span>
        )}
        {event.next_attempt_at && (
          <span>
            {t("traceNextAttemptAt", {
              date: formatDate(event.next_attempt_at),
            })}
          </span>
        )}
        {event.last_error_code && (
          <span className="break-all text-danger">
            {t("traceErrorCode", { code: event.last_error_code })}
          </span>
        )}
      </div>
      <div id={detailId}>
        {expanded && (
          <EventDetails
            channelId={channelId}
            event={event}
            workspaceId={workspaceId}
          />
        )}
      </div>
    </li>
  );
}

export function ChannelEventTrace({
  channelId,
  workspaceId,
}: {
  channelId: string;
  workspaceId: string;
}) {
  const { t, i18n } = useTranslation("channels");
  const queryClient = useQueryClient();
  const query = useChannelEvents(workspaceId, channelId);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const events = query.data?.pages.flatMap((page) => page.items) ?? [];
  const lastUpdated = query.dataUpdatedAt
    ? new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(query.dataUpdatedAt)
    : null;

  function refresh() {
    setExpandedEventId(null);
    void queryClient.resetQueries({
      queryKey: channelEventsQueryKey(workspaceId, channelId),
      exact: true,
    });
  }

  return (
    <section aria-label={t("eventTrace")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="max-w-xl text-sm leading-5 text-muted">
            {t("traceDescription")}
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-muted">
              {t("traceUpdatedAt", { date: lastUpdated })}
            </p>
          )}
        </div>
        <Button
          disabled={query.isFetching}
          onClick={refresh}
          size="sm"
          variant="outline"
        >
          <RefreshCw
            aria-hidden="true"
            className={`size-4 ${query.isRefetching ? "animate-spin" : ""}`}
          />
          {t(query.isRefetching ? "traceRefreshing" : "traceRefresh")}
        </Button>
      </div>

      {query.isError && events.length > 0 && (
        <p
          className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {t("traceLoadError")}
        </p>
      )}
      {query.isPending ? (
        <p className="py-12 text-center text-sm text-muted" role="status">
          {t("traceLoading")}
        </p>
      ) : query.isError && events.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-danger" role="alert">
            {t("traceLoadError")}
          </p>
          <Button
            className="mt-4"
            onClick={refresh}
            size="sm"
            variant="outline"
          >
            {t("retry")}
          </Button>
        </div>
      ) : events.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          {t("traceEmpty")}
        </p>
      ) : (
        <>
          <ol className="mt-5 space-y-3">
            {events.map((event) => (
              <EventRow
                channelId={channelId}
                event={event}
                expanded={expandedEventId === event.id}
                key={event.id}
                onToggle={() =>
                  setExpandedEventId((current) =>
                    current === event.id ? null : event.id,
                  )
                }
                workspaceId={workspaceId}
              />
            ))}
          </ol>
          {query.hasNextPage && (
            <div className="mt-5 flex justify-center">
              <Button
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
                variant="outline"
              >
                {t(query.isFetchingNextPage ? "traceLoading" : "traceLoadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
