const ru = {
  title: "Что-то пошло не так",
  description:
    "Не удалось показать эту страницу. Попробуйте обновить её или вернитесь на главную.",
  reload: "Обновить страницу",
  home: "На главную",
} as const;

const en = {
  title: "Something went wrong",
  description:
    "We couldn't show this page. Try reloading it or return to the home page.",
  reload: "Reload page",
  home: "Go home",
} satisfies Record<keyof typeof ru, string>;

export const errorTranslations = { ru, en } as const;
