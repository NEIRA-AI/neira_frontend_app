const ru = {
  title: "Дашборд",
  comingSoon: "Скоро",
  metric1: "Диалоги",
  metric2: "Новые обращения",
  metric3: "Среднее время ответа",
  activity: "Активность",
  lastWeek: "Последние 7 дней",
  byDay: "Обращения по дням",
  channels: "Статистика по каналам",
  channel: "Канал",
  dialogs: "Диалоги",
  new: "Новые",
  replyTime: "Время ответа",
  minutes: "мин",
  other: "Другие",
} as const;

const en = {
  title: "Dashboard",
  comingSoon: "Coming soon",
  metric1: "Conversations",
  metric2: "New inquiries",
  metric3: "Average response time",
  activity: "Activity",
  lastWeek: "Last 7 days",
  byDay: "Inquiries by day",
  channels: "Channel statistics",
  channel: "Channel",
  dialogs: "Conversations",
  new: "New",
  replyTime: "Response time",
  minutes: "min",
  other: "Other",
} satisfies Record<keyof typeof ru, string>;

export const dashboardPageTranslations = { ru, en } as const;
