import { Outlet } from "react-router";

import { AuthLayout } from "@/widgets/auth-layout";

function AuthRoute() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}

export const Component = AuthRoute;
