export type ChannelPlatform =
  "telegramPremium" | "telegramBot" | "instagram" | "whatsapp" | "facebook";

export type ChannelStatus =
  "active" | "stopped" | "checking" | "needsCheck" | "error";

export type ChannelPreview = {
  id: string;
  platform: ChannelPlatform;
  name: string;
  status: ChannelStatus;
  agent: string | null;
  identifier: string;
  lastCheck: string;
};

export const sampleChannels: ChannelPreview[] = [
  {
    id: "1",
    platform: "telegramPremium",
    name: "Telegram 1",
    status: "active",
    agent: "ИИ-агент",
    identifier: "@testestedf",
    lastCheck: "сегодня, 15:23",
  },
  {
    id: "2",
    platform: "instagram",
    name: "Название канала",
    status: "error",
    agent: null,
    identifier: "tg_neira_support",
    lastCheck: "сегодня, 15:23",
  },
  {
    id: "3",
    platform: "whatsapp",
    name: "Название канала",
    status: "stopped",
    agent: "ИИ-агент",
    identifier: "tg_neira_support",
    lastCheck: "сегодня, 15:23",
  },
  {
    id: "4",
    platform: "facebook",
    name: "Название канала",
    status: "checking",
    agent: "ИИ-агент",
    identifier: "tg_neira_support",
    lastCheck: "сегодня, 15:23",
  },
];
