import { Outlet, useNavigation } from "react-router";

import { useAuth } from "@/features/auth";
import { ImpersonationBanner } from "@/features/impersonation";
import { LoadingScreen } from "@/shared/ui/loading-screen";

export function App() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const impersonating = Boolean(user?.impersonation);

  return (
    <>
      {impersonating ? (
        <div className="flex h-dvh flex-col overflow-hidden [--impersonation-banner-height:4rem] lg:[--impersonation-banner-height:3rem]">
          <ImpersonationBanner />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col">
          <Outlet />
        </div>
      )}
      {navigation.state !== "idle" && (
        <div className="navigation-loading fixed inset-0 z-60">
          <LoadingScreen />
        </div>
      )}
    </>
  );
}
