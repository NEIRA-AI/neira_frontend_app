import { useTranslation } from "react-i18next";

import { Card } from "@/shared/ui/card";

export type WizardStep = 1 | 2 | 3;

export function ProgressCard({ step }: { step: WizardStep }) {
  const { t } = useTranslation("channelConnect");
  const stages = [t("stepChoose"), t("stepSetup"), t("stepAgent")];

  return (
    <Card className="border-0 p-4 sm:p-5 xl:p-4">
      <h2 className="text-sm font-semibold">{t("wizardTitle")}</h2>
      <div
        aria-label={`${step} / 3`}
        className="mt-4 h-1 overflow-hidden rounded-full bg-subtle"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={step}
        aria-valuetext={stages[step - 1]}
      >
        <div
          className={`h-full rounded-full bg-brand-fill transition-[width] duration-200 motion-reduce:transition-none ${step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"}`}
        />
      </div>
      <ol className="mt-5 grid grid-cols-3 gap-2 xl:flex xl:flex-col xl:gap-3">
        {stages.map((label, index) => (
          <li
            aria-current={step === index + 1 ? "step" : undefined}
            className={`flex min-w-0 items-start gap-1.5 text-xs leading-tight sm:text-sm xl:items-center ${step === index + 1 ? "font-semibold text-ink" : "text-muted"}`}
            key={label}
          >
            <span aria-hidden="true" className="shrink-0">
              {index + 1}.
            </span>
            <span className="min-w-0">{label}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
