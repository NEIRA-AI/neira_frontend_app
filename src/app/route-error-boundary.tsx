import { isRouteErrorResponse, useRouteError } from "react-router";

import { NotFoundPage } from "@/pages/not-found";

import { ErrorScreen } from "./error-screen";

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  return <ErrorScreen />;
}
