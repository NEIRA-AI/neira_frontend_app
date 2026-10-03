import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Select } from "@/shared/ui/select";

type Theme = "light" | "dark";

const themeStorageKey = "neira.theme";

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme, persist: boolean) {
  document.documentElement.dataset.theme = theme;

  if (persist) {
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {
      // The selected theme still applies when storage is unavailable.
    }
  }
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation("theme");
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => {
      let saved: string | null = null;
      try {
        saved = window.localStorage.getItem(themeStorageKey);
      } catch {
        // Browser preference remains available when storage is unavailable.
      }
      const next =
        saved === "light" || saved === "dark"
          ? saved
          : media.matches
            ? "dark"
            : "light";
      applyTheme(next, false);
      setTheme(next);
    };

    window.addEventListener("storage", syncTheme);
    media.addEventListener("change", syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
      media.removeEventListener("change", syncTheme);
    };
  }, []);

  return (
    <Select
      ariaLabel={t("label")}
      className={className}
      value={theme}
      onValueChange={(value) => {
        const next = value as Theme;
        applyTheme(next, true);
        setTheme(next);
      }}
      options={[
        { value: "light", label: t("light") },
        { value: "dark", label: t("dark") },
      ]}
    />
  );
}
