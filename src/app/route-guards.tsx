import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation } from "react-router";

import { authReturnPath, useAuth } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { StatusPage } from "@/shared/ui/status-page";

import { LoadingScreen } from "@/shared/ui/loading-screen";

function SessionUnavailable() {
  const { t } = useTranslation("app");
  const { retrySession } = useAuth();

  return (
    <StatusPage
      actions={<Button onClick={retrySession}>{t("retrySession")}</Button>}
      description={t("sessionUnavailableDescription")}
      symbol=":("
      symbolSize="compact"
      title={t("sessionUnavailableTitle")}
    />
  );
}

export function GuestOnlyRoute() {
  const { status, workspaceId } = useAuth();
  const location = useLocation();

  if (status === "loading") return <LoadingScreen />;
  if (status === "error") return <SessionUnavailable />;
  if (status === "authenticated") {
    const destination = authReturnPath(location.state);
    if (destination.startsWith("/invites/")) {
      return <Navigate replace to={destination} />;
    }
    if (!workspaceId) {
      return (
        <Navigate
          replace
          state={{ from: destination }}
          to={ROUTES.SELECT_WORKSPACE}
        />
      );
    }
    return <Navigate replace to={destination} />;
  }
  return <Outlet />;
}

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <LoadingScreen />;
  if (status === "error") return <SessionUnavailable />;
  if (status === "unauthenticated") {
    return (
      <Navigate
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
        to={ROUTES.SIGN_IN}
      />
    );
  }
  return <Outlet />;
}

export function WorkspaceRequiredRoute() {
  const { workspaceId } = useAuth();
  const location = useLocation();

  if (!workspaceId) {
    return (
      <Navigate
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
        to={ROUTES.SELECT_WORKSPACE}
      />
    );
  }
  return <Outlet />;
}
