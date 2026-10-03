const ru = { label: "Язык" } as const;

const en = { label: "Language" } satisfies Record<keyof typeof ru, string>;

export const languageTranslations = { ru, en } as const;
