const ru = {
  support: "Поддержка",
  home: "NEIRA — на главную",
} as const;

const en = {
  support: "Support",
  home: "NEIRA — home",
} satisfies Record<keyof typeof ru, string>;

export const authLayoutTranslations = { ru, en } as const;
