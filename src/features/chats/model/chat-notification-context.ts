import { createContext, useContext } from "react";

import type {
  QueueRealtimeInvalidation,
  RealtimeChange,
} from "@/shared/realtime/types";

export type ChatNotificationContextValue = {
  settingsReady: boolean;
  getSettings: (conversationId: string) => ChatNotificationSettings;
  updateSettings: (
    conversationId: string,
    patch: Partial<ChatNotificationSettings>,
  ) => Promise<void>;
  isSaving: (conversationId: string) => boolean;
  onRealtimeChange: (
    change: RealtimeChange,
    live: boolean,
    invalidate: QueueRealtimeInvalidation,
  ) => void;
  reconcileRealtime: (invalidate: QueueRealtimeInvalidation) => void;
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

export function useChatRealtime() {
  const value = useChatNotificationSettings();
  return {
    onRealtimeChange: value.onRealtimeChange,
    reconcileRealtime: value.reconcileRealtime,
  };
}
