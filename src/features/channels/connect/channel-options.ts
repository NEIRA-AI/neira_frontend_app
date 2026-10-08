import facebookIcon from "../assets/facebook.svg";
import instagramIcon from "../assets/instagram.png";
import jivoIcon from "../assets/jivo.svg";
import maxIcon from "../assets/max.png";
import telegramIcon from "../assets/telegram.png";
import vkIcon from "../assets/vk.svg";
import whatsappIcon from "../assets/whatsapp.svg";
import type { channelConnectTranslations } from "./i18n/translations";

export type ChannelOption = {
  id: string;
  label: keyof typeof channelConnectTranslations.ru;
  icon: string;
};

export const channelOptions: ChannelOption[] = [
  { id: "telegram-premium", label: "telegramPremium", icon: telegramIcon },
  { id: "telegram-personal", label: "telegramPersonal", icon: telegramIcon },
  { id: "facebook", label: "facebook", icon: facebookIcon },
  { id: "instagram", label: "instagram", icon: instagramIcon },
  { id: "whatsapp", label: "whatsapp", icon: whatsappIcon },
  { id: "max", label: "max", icon: maxIcon },
  { id: "jivo", label: "jivo", icon: jivoIcon },
  { id: "vk", label: "vk", icon: vkIcon },
  { id: "telegram-bot", label: "telegramBot", icon: telegramIcon },
];

export const channelAliases: Record<string, string> = {
  telegramPremium: "telegram-premium",
  telegramBot: "telegram-bot",
};
