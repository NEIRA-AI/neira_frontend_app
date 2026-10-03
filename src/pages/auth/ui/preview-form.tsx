import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";

interface PreviewFormProps {
  children: ReactNode;
  submitLabel: string;
  afterSubmit?: ReactNode;
  className?: string;
}

export function PreviewForm({
  children,
  submitLabel,
  afterSubmit,
  className,
}: PreviewFormProps) {
  const { t } = useTranslation("auth");
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className={className}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      {children}
      <div className="space-y-4 pt-1">
        <Button className="w-full" size="lg" type="submit" variant="primary">
          {submitLabel}
        </Button>
        {submitted && (
          <p
            className="rounded-xl border border-brand/20 bg-brand-soft px-4 py-3 text-center text-sm text-brand"
            role="status"
          >
            {t("common.previewNotice")}
          </p>
        )}
        {afterSubmit}
      </div>
    </form>
  );
}
