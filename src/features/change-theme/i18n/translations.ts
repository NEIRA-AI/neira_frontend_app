const ru = {
  label: "Тема оформления",
  light: "Светлая",
  dark: "Тёмная",
} as const;

const en = {
  label: "Theme",
  light: "Light",
  dark: "Dark",
} satisfies Record<keyof typeof ru, string>;

export const themeTranslations = { ru, en } as const;
