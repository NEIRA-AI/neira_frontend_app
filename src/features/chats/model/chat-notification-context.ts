import { createContext, useContext } from "react";

export type ChatNotificationContextValue = {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
};

export const ChatNotificationContext =
  createContext<ChatNotificationContextValue | null>(null);

export function useChatNotificationSettings() {
  const value = useContext(ChatNotificationContext);
  if (!value)
    throw new Error("Chat notifications must be inside their provider");
  return value;
}
