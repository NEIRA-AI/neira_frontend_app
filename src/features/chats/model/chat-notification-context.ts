import { createContext, useContext } from "react";

export type ChatNotificationContextValue = {
  settingsReady: boolean;
  getSettings: (conversationId: string) => ChatNotificationSettings;
  updateSettings: (
    conversationId: string,
    patch: Partial<ChatNotificationSettings>,
  ) => Promise<void>;
  isSaving: (conversationId: string) => boolean;
};

export type ChatNotificationSettings = {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
};

export const ChatNotificationContext =
  createContext<ChatNotificationContextValue | null>(null);

export function useChatNotificationSettings() {
  const value = useContext(ChatNotificationContext);
  if (!value)
    throw new Error("Chat notifications must be inside their provider");
  return value;
}
