import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";

import { AuthPageHeading } from "./ui/auth-page-heading";
import { PreviewForm } from "./ui/preview-form";

const codeLength = 6;

function VerifyPage() {
  const { t } = useTranslation("auth");
  const [code, setCode] = useState("");

  return (
    <div className="w-full max-w-md space-y-8">
      <AuthPageHeading
        description={t("verify.description")}
        title={t("verify.title")}
      />

      <PreviewForm
        afterSubmit={
          <>
            <div className="flex items-center gap-3 text-sm text-muted">
              <span className="h-px flex-1 bg-line" />
              <span>{t("verify.codeNotReceived")}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <Button
              className="w-full"
              disabled
              size="lg"
              type="button"
              variant="secondary"
            >
              {t("verify.resend")}
            </Button>
          </>
        }
        className="space-y-5"
        submitLabel={t("verify.submit")}
      >
        <label
          className="group relative block cursor-text"
          htmlFor="verification-code"
        >
          <span className="sr-only">{t("verify.code")}</span>
          <input
            autoComplete="one-time-code"
            className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
            id="verification-code"
            inputMode="numeric"
            maxLength={codeLength}
            name="code"
            onChange={(event) =>
              setCode(
                event.target.value.replace(/\D/g, "").slice(0, codeLength),
              )
            }
            pattern="[0-9]{6}"
            required
            type="text"
            value={code}
          />
          <span
            aria-hidden="true"
            className="flex justify-center gap-2 sm:gap-3"
          >
            {Array.from({ length: codeLength }, (_, index) => (
              <span
                className="flex aspect-square min-w-0 max-w-12 flex-1 items-center justify-center rounded-lg border border-line bg-surface text-xl font-medium text-ink transition-colors group-focus-within:border-brand group-focus-within:ring-1 group-focus-within:ring-brand"
                key={index}
              >
                {code[index] ?? ""}
              </span>
            ))}
          </span>
        </label>
      </PreviewForm>
    </div>
  );
}

export const Component = VerifyPage;
