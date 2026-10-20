import { generatePath } from "react-router";

export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  RESET_PASSWORD_LEGACY_LINK: "/auth/reset",
  SELECT_WORKSPACE: "/auth/select-workspace",
  VERIFY: "/auth/verify",
  INVITATION: "/invites/:token",
  DASHBOARD: "/dashboard",
  CHANNELS: "/channels",
  CONTACTS: "/contacts",
  CONTACT_DETAILS: "/contacts/:contactId",
  CHANNELS_CONNECT: "/channels/connect",
  CHANNEL_DETAILS: "/channels/:channelId",
  FUNNELS: "/funnels",
  MESSAGES: "/messages",
  MESSAGE_CONVERSATION: "/messages/:conversationId",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
} as const;

export type PathParams = {
  [ROUTES.CHANNEL_DETAILS]: {
    channelId: string;
  };
  [ROUTES.CONTACT_DETAILS]: {
    contactId: string;
  };
  [ROUTES.INVITATION]: {
    token: string;
  };
  [ROUTES.MESSAGE_CONVERSATION]: {
    conversationId: string;
  };
};

declare module "react-router" {
  interface Register {
    params: PathParams;
  }
}

export function channelDetailsPath(channelId: string) {
  return generatePath(ROUTES.CHANNEL_DETAILS, { channelId });
}

export function contactDetailsPath(contactId: string) {
  return generatePath(ROUTES.CONTACT_DETAILS, { contactId });
}

export function messageConversationPath(conversationId: string) {
  return generatePath(ROUTES.MESSAGE_CONVERSATION, { conversationId });
}
