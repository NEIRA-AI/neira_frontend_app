import { languageTranslations } from "@/features/change-language";
import { themeTranslations } from "@/features/change-theme";
import { authTranslations } from "@/pages/auth";
import { notFoundTranslations } from "@/pages/not-found";
import { settingsTranslations } from "@/pages/settings";
import { authLayoutTranslations } from "@/widgets/auth-layout";
import { cabinetTranslations } from "@/widgets/cabinet-layout";

import { errorTranslations } from "./error-translations";
import { appTranslations } from "./translations";

export const defaultNS = "app";

const ru = {
  app: appTranslations.ru,
  auth: authTranslations.ru,
  authLayout: authLayoutTranslations.ru,
  cabinet: cabinetTranslations.ru,
  error: errorTranslations.ru,
  language: languageTranslations.ru,
  notFound: notFoundTranslations.ru,
  settings: settingsTranslations.ru,
  theme: themeTranslations.ru,
};

const en = {
  app: appTranslations.en,
  auth: authTranslations.en,
  authLayout: authLayoutTranslations.en,
  cabinet: cabinetTranslations.en,
  error: errorTranslations.en,
  language: languageTranslations.en,
  notFound: notFoundTranslations.en,
  settings: settingsTranslations.en,
  theme: themeTranslations.en,
} satisfies Record<keyof typeof ru, object>;

export const resources = { ru, en } as const;
