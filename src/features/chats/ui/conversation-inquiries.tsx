import { ArrowUpRight, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { useContactInquiries } from "@/features/contacts";
import { contactDetailsPath } from "@/shared/config/routes";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

const PREVIEW_LIMIT = 5;

export function ConversationInquiries({
  contactId,
  workspaceId,
}: {
  contactId: string;
  workspaceId: string;
}) {
  const { t } = useTranslation("chats");
  const query = useContactInquiries(workspaceId, contactId, PREVIEW_LIMIT);
  const inquiries = query.data?.pages[0]?.items ?? [];

  return (
    <section
      aria-labelledby="chat-contact-inquiries-title"
      className="border-t border-line px-5 py-5"
    >
      <h3
        className="text-sm font-semibold text-ink"
        id="chat-contact-inquiries-title"
      >
        {t("inquiries")}
      </h3>
      {query.isPending ? (
        <p className="mt-3 text-sm text-muted" role="status">
          {t("loadingInquiries")}
        </p>
      ) : query.isError && inquiries.length === 0 ? (
        <div className="mt-3">
          <p className="text-sm text-danger" role="alert">
            {t("inquiriesLoadError")}
          </p>
          <Button
            className="mt-2"
            onClick={() => void query.refetch()}
            size="sm"
            variant="outline"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {t("retry")}
          </Button>
        </div>
      ) : inquiries.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{t("noInquiries")}</p>
      ) : (
        <>
          {query.isError && (
            <p className="mt-3 text-sm text-danger" role="alert">
              {t("inquiriesLoadError")}
            </p>
          )}
          <ul className="mt-3 space-y-2">
            {inquiries.map((inquiry) => {
              const funnel = inquiry.funnel_name || t("unknownFunnel");
              const status = inquiry.status_name || t("unknownStatus");
              return (
                <li key={inquiry.id}>
                  <Link
                    aria-label={t("openInquiryInContact", {
                      id: inquiry.id.slice(0, 8),
                      funnel,
                      status,
                    })}
                    className="group block rounded-xl border border-line px-3 py-3 transition-colors hover:border-brand hover:bg-brand-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    to={`${contactDetailsPath(contactId)}#inquiry-${inquiry.id}`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate text-xs text-muted">
                          {t("inquiryNumber", { id: inquiry.id.slice(0, 8) })}
                        </span>
                        <span className="mt-1 block break-words text-sm font-semibold text-ink group-hover:text-brand">
                          {funnel}
                        </span>
                      </span>
                      <Badge
                        className="shrink-0"
                        tone={inquiry.state === "open" ? "success" : "neutral"}
                      >
                        {inquiry.state === "open"
                          ? t("inquiryOpen")
                          : inquiry.state === "closed"
                            ? t("inquiryClosed")
                            : inquiry.state}
                      </Badge>
                    </span>
                    <span className="mt-2 block break-words text-xs text-muted">
                      {t("inquiryStage", { status })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            to={`${contactDetailsPath(contactId)}#contact-inquiries-title`}
          >
            {t("allInquiriesInContact")}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </>
      )}
    </section>
  );
}
