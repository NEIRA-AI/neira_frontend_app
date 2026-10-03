import { Outlet } from "react-router";

import { CabinetLayout } from "@/widgets/cabinet-layout";

function CabinetRoute() {
  return (
    <CabinetLayout>
      <Outlet />
    </CabinetLayout>
  );
}

export const Component = CabinetRoute;
