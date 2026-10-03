import { Outlet } from "react-router";

/** Route position reserved for authentication when the session flow is added. */
export function ProtectedLayout() {
  return <Outlet />;
}
