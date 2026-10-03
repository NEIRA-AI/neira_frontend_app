import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/shared/ui/input";

import { AuthField } from "./auth-field";

interface PasswordFieldProps {
  id: string;
  label: string;
  autoComplete: "current-password" | "new-password";
}

export function PasswordField({ id, label, autoComplete }: PasswordFieldProps) {
  const { t } = useTranslation("auth");
  const [isVisible, setIsVisible] = useState(false);

  return (
    <AuthField id={id} label={label}>
      <div className="relative">
        <Input
          autoComplete={autoComplete}
          className="pr-12"
          id={id}
          name={id}
          placeholder={t("common.passwordPlaceholder")}
          required
          type={isVisible ? "text" : "password"}
        />
        <button
          aria-label={t(
            isVisible ? "common.hidePassword" : "common.showPassword",
          )}
          aria-pressed={isVisible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
          onClick={() => setIsVisible((visible) => !visible)}
          type="button"
        >
          {isVisible ? (
            <Eye className="size-5" />
          ) : (
            <EyeOff className="size-5" />
          )}
        </button>
      </div>
    </AuthField>
  );
}
