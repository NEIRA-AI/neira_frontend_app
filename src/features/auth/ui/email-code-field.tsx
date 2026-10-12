import { useTranslation } from "react-i18next";

interface EmailCodeFieldProps {
  code: string;
  disabled?: boolean;
  error?: string | null;
  onChange: (code: string) => void;
}

export function EmailCodeField({
  code,
  disabled,
  error,
  onChange,
}: EmailCodeFieldProps) {
  const { t } = useTranslation("auth");

  return (
    <div className="space-y-2">
      <label
        className="group relative block cursor-text"
        htmlFor="email-verification-code"
      >
        <span className="sr-only">{t("verify.code")}</span>
        <input
          aria-describedby={error ? "email-verification-code-error" : undefined}
          aria-invalid={Boolean(error)}
          autoComplete="one-time-code"
          autoFocus
          className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
          disabled={disabled}
          id="email-verification-code"
          inputMode="numeric"
          maxLength={6}
          name="code"
          onChange={(event) =>
            onChange(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          pattern="[0-9]{6}"
          required
          type="text"
          value={code}
        />
        <span aria-hidden="true" className="flex justify-center gap-2 sm:gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <span
              className="flex aspect-square min-w-0 max-w-12 flex-1 items-center justify-center rounded-lg border border-line bg-surface text-xl font-medium text-ink transition-colors group-focus-within:border-brand group-focus-within:ring-1 group-focus-within:ring-brand"
              key={index}
            >
              {code[index] ?? ""}
            </span>
          ))}
        </span>
      </label>
      {error && (
        <p
          className="text-center text-sm text-danger"
          id="email-verification-code-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
