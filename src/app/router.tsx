import { createBrowserRouter, redirect } from "react-router";

import { RouteErrorBoundary } from "@/features/error-boundary";
import { NotFoundPage } from "@/features/not-found";
import { ROUTES } from "@/shared/config/routes";
import { LoadingScreen } from "@/shared/ui/loading-screen";

import { App } from "./app";
import { Providers } from "./providers";
import {
  GuestOnlyRoute,
  ProtectedRoute,
  WorkspaceRequiredRoute,
} from "./route-guards";

export const router = createBrowserRouter([
  {
    element: (
      <Providers>
        <App />
      </Providers>
    ),
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: LoadingScreen,
    children: [
      {
        path: ROUTES.HOME,
        loader: () => redirect(ROUTES.SETTINGS),
        Component: LoadingScreen,
      },
      {
        element: <GuestOnlyRoute />,
        children: [
          {
            path: ROUTES.SIGN_IN,
            lazy: () => import("@/features/auth/sign-in.page"),
          },
          {
            path: ROUTES.SIGN_UP,
            lazy: () => import("@/features/auth/sign-up.page"),
          },
          {
            path: ROUTES.FORGOT_PASSWORD,
            lazy: () => import("@/features/auth/forgot-password.page"),
          },
          {
            path: ROUTES.RESET_PASSWORD,
            lazy: () => import("@/features/auth/reset-password.page"),
          },
          {
            path: ROUTES.RESET_PASSWORD_LEGACY_LINK,
            lazy: () => import("@/features/auth/reset-password.page"),
          },
          {
            path: ROUTES.VERIFY,
            lazy: () => import("@/features/auth/verify.page"),
          },
        ],
      },
      {
        path: ROUTES.INVITATION,
        lazy: () => import("@/features/invitations/invitation.page"),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: ROUTES.SELECT_WORKSPACE,
            lazy: () => import("@/features/workspaces/select-workspace.page"),
          },
          {
            lazy: () =>
              import("@/features/dashboard-layout/ui/dashboard-layout"),
            children: [
              {
                path: ROUTES.NOTIFICATIONS,
                lazy: () =>
                  import("@/features/notifications/notifications.page"),
              },
              {
                element: <WorkspaceRequiredRoute />,
                children: [
                  {
                    path: ROUTES.CHANNELS,
                    lazy: () => import("@/features/channels/channels.page"),
                  },
                  {
                    path: ROUTES.CONTACTS,
                    lazy: () => import("@/features/contacts/contacts.page"),
                  },
                  {
                    path: ROUTES.CONTACT_DETAILS,
                    lazy: () => import("@/features/contacts/contact.page"),
                  },
                  {
                    path: ROUTES.CHANNELS_CONNECT,
                    lazy: () =>
                      import("@/features/channels/connect-channel.page"),
                  },
                  {
                    path: ROUTES.CHANNEL_DETAILS,
                    lazy: () => import("@/features/channels/channel.page"),
                  },
                  {
                    lazy: () =>
                      import("@/features/channels-preview/channels-preview-route"),
                    children: [
                      {
                        path: ROUTES.CHANNELS_PREVIEW,
                        lazy: () =>
                          import("@/features/channels-preview/channels-preview.page"),
                      },
                      {
                        path: ROUTES.CHANNELS_PREVIEW_CONNECT,
                        lazy: () =>
                          import("@/features/channels-preview/connect/connect-channel-preview.page"),
                      },
                      {
                        path: ROUTES.CHANNELS_PREVIEW_DETAILS,
                        lazy: () =>
                          import("@/features/channels-preview/channel-preview-edit.page"),
                      },
                    ],
                  },
                  {
                    path: ROUTES.FUNNELS,
                    lazy: () => import("@/features/funnels/funnels.page"),
                  },
                  {
                    path: ROUTES.MESSAGES,
                    lazy: () => import("@/features/chats/chats.page"),
                  },
                  {
                    path: ROUTES.MESSAGE_CONVERSATION,
                    lazy: () => import("@/features/chats/chats.page"),
                  },
                  {
                    path: ROUTES.SETTINGS,
                    lazy: () => import("@/features/settings/settings.page"),
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
