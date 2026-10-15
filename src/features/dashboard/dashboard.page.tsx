import { LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";

const metricValues = [
  { label: "metric1", value: "1 284" },
  { label: "metric2", value: "326" },
  { label: "metric3", value: "4" },
] as const;
const barHeights = [45, 72, 54, 88, 61, 76, 95];
const tableValues = [
  ["Telegram", "642", "181", "3"],
  ["VK", "438", "104", "5"],
  ["Other", "204", "41", "7"],
] as const;

function DashboardPreview() {
  const { t } = useTranslation("dashboardPage");

  return (
    <div aria-hidden="true" className="space-y-5 blur-[6px] select-none">
      <div className="grid gap-4 sm:grid-cols-3">
        {metricValues.map(({ label, value }) => (
          <div
            className="rounded-2xl border border-line bg-surface p-5 shadow-sm"
            key={label}
          >
            <div className="mb-8 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-muted">{t(label)}</span>
              <span className="size-9 rounded-xl bg-brand-soft" />
            </div>
            <div className="text-3xl font-semibold text-ink">
              {value}
              {label === "metric3" && ` ${t("minutes")}`}
            </div>
            <div className="mt-3 h-2 w-24 rounded-full bg-success-soft" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="font-semibold text-ink">{t("activity")}</h3>
            <span className="rounded-lg bg-subtle px-3 py-1.5 text-xs text-muted">
              {t("lastWeek")}
            </span>
          </div>
          <div className="h-56 rounded-xl bg-page px-3 py-4 sm:h-64">
            <svg
              className="size-full overflow-visible text-brand"
              preserveAspectRatio="none"
              viewBox="0 0 640 220"
            >
              <path
                d="M0 190H640M0 140H640M0 90H640M0 40H640"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.13"
              />
              <path
                d="M0 170C45 165 60 135 105 148S180 168 220 110 285 114 325 96 390 128 430 72 505 90 550 48 605 58 640 18V220H0Z"
                fill="currentColor"
                opacity="0.12"
              />
              <path
                d="M0 170C45 165 60 135 105 148S180 168 220 110 285 114 325 96 390 128 430 72 505 90 550 48 605 58 640 18"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <h3 className="font-semibold text-ink">{t("byDay")}</h3>
          <div className="mt-8 flex h-56 items-end justify-between gap-3 border-b border-line pb-3 sm:h-64">
            {barHeights.map((height, index) => (
              <div className="flex h-full min-w-0 flex-1 items-end" key={index}>
                <div
                  className="w-full rounded-t-lg bg-brand-20"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-semibold text-ink">{t("channels")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-subtle text-muted">
              <tr>
                <th className="px-5 py-3 font-medium" scope="col">
                  {t("channel")}
                </th>
                <th className="px-5 py-3 font-medium" scope="col">
                  {t("dialogs")}
                </th>
                <th className="px-5 py-3 font-medium" scope="col">
                  {t("new")}
                </th>
                <th className="px-5 py-3 font-medium" scope="col">
                  {t("replyTime")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink">
              {tableValues.map((row) => (
                <tr key={row[0]}>
                  <td className="px-5 py-4">
                    {row[0] === "Other" ? t("other") : row[0]}
                  </td>
                  <td className="px-5 py-4">{row[1]}</td>
                  <td className="px-5 py-4">{row[2]}</td>
                  <td className="px-5 py-4">
                    {row[3]} {t("minutes")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTranslation("dashboardPage");

  return (
    <div className="min-h-[calc(100dvh-4rem-var(--impersonation-banner-height,0px))] bg-page lg:min-h-[calc(100dvh-var(--impersonation-banner-height,0px))]">
      <header className="border-b border-line bg-page">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        </div>
      </header>
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DashboardPreview />
        <div className="absolute inset-0 flex items-start justify-center px-4 pt-24 sm:items-center sm:pt-0">
          <div className="flex items-center gap-4 rounded-3xl border border-line bg-surface px-8 py-6 shadow-xl sm:px-10 sm:py-8">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <LockKeyhole aria-hidden="true" className="size-6" />
            </span>
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">
              {t("comingSoon")}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Component = DashboardPage;
