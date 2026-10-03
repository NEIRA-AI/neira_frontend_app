import { Outlet, useNavigation } from "react-router";

import { RouteLoadingScreen } from "./route-loading-screen";

export function App() {
  const navigation = useNavigation();

  return (
    <>
      <Outlet />
      {navigation.state !== "idle" && (
        <div className="navigation-loading fixed inset-0 z-60">
          <RouteLoadingScreen />
        </div>
      )}
    </>
  );
}
