const ru = {
  loading: "Загружаем приглашение…",
  loadErrorTitle: "Не удалось открыть приглашение",
  loadErrorDescription: "Проверьте соединение и попробуйте ещё раз.",
  retry: "Повторить",
  invalidTitle: "Приглашение не найдено",
  invalidDescription: "Проверьте ссылку или попросите отправить новую.",
  title: "Вас пригласили в пространство",
  description:
    "Присоединитесь к «{{workspace}}», чтобы работать вместе с командой.",
  invitationEmail: "Адрес приглашения",
  yourAccount: "Ваш аккаунт",
  workspace: "Пространство",
  role: "Ваша роль: {{role}}",
  roles: {
    admin: "администратор",
    manager: "менеджер",
    reader: "просмотр",
    member: "участник",
  },
  confirm: "Подтвердить",
  decline: "Отклонить",
  confirming: "Подтверждаем…",
  declining: "Отклоняем…",
  actionError: "Не удалось выполнить действие. Попробуйте ещё раз.",
  emailMismatchTitle: "Приглашение для другого аккаунта",
  emailMismatchDescription:
    "Это приглашение отправлено на {{invitedEmail}}, а вы вошли как {{currentEmail}}. Войдите с нужным адресом, чтобы продолжить.",
  switchAccount: "Войти с другим адресом",
  switchingAccount: "Выходим…",
  sessionErrorTitle: "Не удалось проверить сеанс",
  sessionErrorDescription: "Проверьте соединение и попробуйте ещё раз.",
  expiredTitle: "Срок приглашения истёк",
  expiredDescription:
    "Попросите владельца или администратора пространства отправить новое приглашение.",
  revokedTitle: "Приглашение отменено",
  revokedDescription:
    "Это приглашение больше не действует. Попросите отправить новое, если доступ всё ещё нужен.",
  acceptedTitle: "Приглашение уже принято",
  acceptedDescription: "Это приглашение уже использовано.",
  declinedTitle: "Приглашение отклонено",
  declinedDescription:
    "Если вы передумали, попросите владельца или администратора отправить новое приглашение.",
  unavailableTitle: "Приглашение недоступно",
  unavailableDescription: "Попросите отправить новое приглашение.",
  toApp: "Перейти в приложение",
} as const;

const en = {
  loading: "Loading invitation…",
  loadErrorTitle: "Could not open the invitation",
  loadErrorDescription: "Check your connection and try again.",
  retry: "Try again",
  invalidTitle: "Invitation not found",
  invalidDescription: "Check the link or ask for a new invitation.",
  title: "You have been invited to a workspace",
  description: "Join {{workspace}} to work with the team.",
  invitationEmail: "Invited email",
  yourAccount: "Your account",
  workspace: "Workspace",
  role: "Your role: {{role}}",
  roles: {
    admin: "admin",
    manager: "manager",
    reader: "viewer",
    member: "member",
  },
  confirm: "Confirm",
  decline: "Decline",
  confirming: "Confirming…",
  declining: "Declining…",
  actionError: "Could not complete the action. Try again.",
  emailMismatchTitle: "Invitation for another account",
  emailMismatchDescription:
    "This invitation was sent to {{invitedEmail}}, but you are signed in as {{currentEmail}}. Sign in with the invited address to continue.",
  switchAccount: "Sign in with another email",
  switchingAccount: "Signing out…",
  sessionErrorTitle: "Could not check your session",
  sessionErrorDescription: "Check your connection and try again.",
  expiredTitle: "Invitation expired",
  expiredDescription:
    "Ask the workspace owner or admin to send a new invitation.",
  revokedTitle: "Invitation revoked",
  revokedDescription:
    "This invitation is no longer active. Ask for a new one if you still need access.",
  acceptedTitle: "Invitation already accepted",
  acceptedDescription: "This invitation has already been used.",
  declinedTitle: "Invitation declined",
  declinedDescription:
    "If you changed your mind, ask the workspace owner or admin for a new invitation.",
  unavailableTitle: "Invitation unavailable",
  unavailableDescription: "Ask for a new invitation.",
  toApp: "Go to app",
} satisfies {
  [Section in keyof typeof ru]: (typeof ru)[Section] extends object
    ? Record<keyof (typeof ru)[Section], string>
    : string;
};

export const invitationsTranslations = { ru, en } as const;
