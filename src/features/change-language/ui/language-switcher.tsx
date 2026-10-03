import { useTranslation } from "react-i18next";

import {
  defaultLanguage,
  languageStorageKey,
  languages,
  type Language,
} from "@/shared/i18n/languages";
import { Select } from "@/shared/ui/select";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation("language");

  const changeLanguage = async (language: Language) => {
    await i18n.changeLanguage(language);

    try {
      window.localStorage.setItem(languageStorageKey, language);
    } catch {
      // The selected language still applies when storage is unavailable.
    }
  };

  return (
    <Select
      ariaLabel={t("label")}
      className={className}
      value={i18n.resolvedLanguage ?? defaultLanguage}
      onValueChange={(value) => void changeLanguage(value as Language)}
      options={languages.map(({ code, name }) => ({
        value: code,
        label: name,
      }))}
    />
  );
}
