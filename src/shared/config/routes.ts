import { generatePath } from "react-router";

export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  SELECT_WORKSPACE: "/auth/select-workspace",
  VERIFY: "/auth/verify",
  INVITATION: "/invites/:token",
  CHANNELS: "/channels",
  CHANNELS_CONNECT: "/channels/connect",
  CHANNEL_DETAILS: "/channels/:channelId",
  CHANNELS_PREVIEW: "/preview/channels",
  CHANNELS_PREVIEW_CONNECT: "/preview/channels/connect",
  CHANNELS_PREVIEW_DETAILS: "/preview/channels/:channelId",
  FUNNELS: "/funnels",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
} as const;

export type PathParams = {
  [ROUTES.CHANNEL_DETAILS]: {
    channelId: string;
  };
  [ROUTES.CHANNELS_PREVIEW_DETAILS]: {
    channelId: string;
  };
  [ROUTES.INVITATION]: {
    token: string;
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

export function channelPreviewDetailsPath(channelId: string) {
  return generatePath(ROUTES.CHANNELS_PREVIEW_DETAILS, { channelId });
}
