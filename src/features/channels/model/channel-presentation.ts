import telegramIcon from "../assets/telegram.png";
import vkIcon from "../assets/vk.svg";
import type { ChannelProvider, ChannelRead } from "../api/channels-api";

export const channelProviders = [
  { id: "telegram_bot", icon: telegramIcon, label: "telegramBot" },
  { id: "vk_community", icon: vkIcon, label: "vkCommunity" },
] as const satisfies ReadonlyArray<{
  id: ChannelProvider;
  icon: string;
  label: "telegramBot" | "vkCommunity";
}>;

export function providerDetails(provider: ChannelProvider) {
  return (
    channelProviders.find((item) => item.id === provider) ?? channelProviders[0]
  );
}

export function channelProfileField(
  profile: ChannelRead["profile"],
  field: "name" | "username" | "avatar_url",
) {
  const value = profile[field];
  return typeof value === "string" && value.trim() ? value : null;
}

export function formatCheckTime(value: string | null, language: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(language, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}
