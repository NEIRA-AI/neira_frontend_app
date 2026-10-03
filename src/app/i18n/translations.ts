const ru = {
  loading: "Загрузка…",
} as const;

const en = {
  loading: "Loading…",
} satisfies Record<keyof typeof ru, string>;

export const appTranslations = { ru, en } as const;
