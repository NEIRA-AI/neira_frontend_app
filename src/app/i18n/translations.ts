const ru = {
  loading: "Загрузка…",
  sessionUnavailableTitle: "Не удалось проверить сеанс",
  sessionUnavailableDescription:
    "Не удалось определить, активен ли ваш сеанс. Попробуйте ещё раз.",
  retrySession: "Повторить попытку",
} as const;

const en = {
  loading: "Loading…",
  sessionUnavailableTitle: "Could not check your session",
  sessionUnavailableDescription:
    "We could not determine whether your session is active. Please try again.",
  retrySession: "Try again",
} satisfies Record<keyof typeof ru, string>;

export const appTranslations = { ru, en } as const;
