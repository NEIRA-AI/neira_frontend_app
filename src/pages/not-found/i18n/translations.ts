const ru = {
  title: "Страница не найдена",
  description:
    "Похоже, такой страницы больше нет или адрес был введён с ошибкой.",
  backToHome: "На главную",
  goBack: "Назад",
} as const;

const en = {
  title: "Page not found",
  description: "This page is no longer here, or the address may be incorrect.",
  backToHome: "Back to home",
  goBack: "Go back",
} satisfies Record<keyof typeof ru, string>;

export const notFoundTranslations = { ru, en } as const;
