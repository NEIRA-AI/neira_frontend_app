import { languageTranslations } from "@/features/change-language";
import { themeTranslations } from "@/features/change-theme";
import { authTranslations } from "@/features/auth";
import { channelsTranslations } from "@/features/channels";
import { chatsTranslations } from "@/features/chats";
import { contactsTranslations } from "@/features/contacts";
import {
  channelEditPreviewTranslations,
  channelConnectPreviewTranslations,
  channelsPreviewTranslations,
} from "@/features/channels-preview";
import { dashboardTranslations } from "@/features/dashboard-layout";
import { dashboardPageTranslations } from "@/features/dashboard";
import { errorTranslations } from "@/features/error-boundary";
import { funnelsTranslations } from "@/features/funnels";
import { invitationsTranslations } from "@/features/invitations";
import { impersonationTranslations } from "@/features/impersonation";
import { membersTranslations } from "@/features/members";
import { notesTranslations } from "@/features/notes";
import { notFoundTranslations } from "@/features/not-found";
import { notificationsTranslations } from "@/features/notifications";
import { settingsTranslations } from "@/features/settings";
import { workspacesTranslations } from "@/features/workspaces";

import { appTranslations } from "./translations";

export const defaultNS = "app";

const ru = {
  app: appTranslations.ru,
  auth: authTranslations.ru,
  dashboard: dashboardTranslations.ru,
  dashboardPage: dashboardPageTranslations.ru,
  channels: channelsTranslations.ru,
  chats: chatsTranslations.ru,
  contacts: contactsTranslations.ru,
  channelsPreview: channelsPreviewTranslations.ru,
  channelEditPreview: channelEditPreviewTranslations.ru,
  channelConnectPreview: channelConnectPreviewTranslations.ru,
  error: errorTranslations.ru,
  funnels: funnelsTranslations.ru,
  invitations: invitationsTranslations.ru,
  impersonation: impersonationTranslations.ru,
  language: languageTranslations.ru,
  members: membersTranslations.ru,
  notes: notesTranslations.ru,
  notFound: notFoundTranslations.ru,
  notifications: notificationsTranslations.ru,
  settings: settingsTranslations.ru,
  theme: themeTranslations.ru,
  workspaces: workspacesTranslations.ru,
};

const en = {
  app: appTranslations.en,
  auth: authTranslations.en,
  dashboard: dashboardTranslations.en,
  dashboardPage: dashboardPageTranslations.en,
  channels: channelsTranslations.en,
  chats: chatsTranslations.en,
  contacts: contactsTranslations.en,
  channelsPreview: channelsPreviewTranslations.en,
  channelEditPreview: channelEditPreviewTranslations.en,
  channelConnectPreview: channelConnectPreviewTranslations.en,
  error: errorTranslations.en,
  funnels: funnelsTranslations.en,
  invitations: invitationsTranslations.en,
  impersonation: impersonationTranslations.en,
  language: languageTranslations.en,
  members: membersTranslations.en,
  notes: notesTranslations.en,
  notFound: notFoundTranslations.en,
  notifications: notificationsTranslations.en,
  settings: settingsTranslations.en,
  theme: themeTranslations.en,
  workspaces: workspacesTranslations.en,
} satisfies Record<keyof typeof ru, object>;

export const resources = { ru, en } as const;
