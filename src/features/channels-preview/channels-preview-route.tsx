import { Outlet } from "react-router";

import { useAuth } from "@/features/auth";

import { ChannelsPreviewProvider } from "./model/channels-preview-provider";

function ChannelsPreviewRoute() {
  const { workspaceId } = useAuth();

  return (
    <ChannelsPreviewProvider key={workspaceId}>
      <Outlet />
    </ChannelsPreviewProvider>
  );
}

export const Component = ChannelsPreviewRoute;
