import { Outlet, useNavigation } from "react-router";

import { LoadingScreen } from "@/shared/ui/loading-screen";

export function App() {
  const navigation = useNavigation();

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Outlet />
      </div>
      {navigation.state !== "idle" && (
        <div className="navigation-loading fixed inset-0 z-60">
          <LoadingScreen />
        </div>
      )}
    </>
  );
}
