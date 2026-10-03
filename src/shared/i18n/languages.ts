export const languages = [
  { code: "ru", name: "Русский" },
  { code: "en", name: "English" },
] as const;

export type Language = (typeof languages)[number]["code"];

export const defaultLanguage: Language = "ru";
export const languageStorageKey = "neira.language";
