import { createBrowserRouter } from "react-router";

import { NotFoundPage } from "@/pages/not-found";
import { ROUTES } from "@/shared/routes";

import { App } from "./app";
import { ProtectedLayout } from "./protected-layout";
import { Providers } from "./providers";
import { RouteErrorBoundary } from "./route-error-boundary";
import { RouteLoadingScreen } from "./route-loading-screen";

export const router = createBrowserRouter([
  {
    element: (
      <Providers>
        <App />
      </Providers>
    ),
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: RouteLoadingScreen,
    children: [
      {
        lazy: () => import("./auth-route"),
        children: [
          {
            path: ROUTES.SIGN_IN,
            lazy: () => import("@/pages/auth/sign-in.page"),
          },
          {
            path: ROUTES.SIGN_UP,
            lazy: () => import("@/pages/auth/sign-up.page"),
          },
          {
            path: ROUTES.VERIFY,
            lazy: () => import("@/pages/auth/verify.page"),
          },
        ],
      },
      {
        element: <ProtectedLayout />,
        children: [
          {
            lazy: () => import("./cabinet-route"),
            children: [
              { path: ROUTES.HOME, lazy: () => import("@/pages/home") },
              {
                path: ROUTES.SETTINGS,
                lazy: () => import("@/pages/settings/settings.page"),
              },
            ],
          },
        ],
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
