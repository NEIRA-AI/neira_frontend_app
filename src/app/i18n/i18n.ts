import { createInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import {
  defaultLanguage,
  languageStorageKey,
  languages,
} from "@/shared/i18n/languages";

import { defaultNS, resources } from "./resources";

export const i18n = createInstance();

function updateDocumentLanguage() {
  const language = i18n.resolvedLanguage ?? defaultLanguage;
  document.documentElement.lang = language;
  document.documentElement.dir = i18n.dir(language);
}

export async function initI18n() {
  if (i18n.isInitialized) return;

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      supportedLngs: languages.map(({ code }) => code),
      fallbackLng: defaultLanguage,
      load: "languageOnly",
      defaultNS,
      ns: Object.keys(resources.ru),
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: languageStorageKey,
        caches: [],
      },
      interpolation: { escapeValue: false },
    });

  i18n.on("languageChanged", updateDocumentLanguage);
  updateDocumentLanguage();
}
