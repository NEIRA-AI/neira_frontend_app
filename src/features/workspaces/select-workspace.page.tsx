import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

import {
  AuthLayout,
  authReturnPath,
  useAuth,
  useSignOut,
  WorkspaceSelection,
} from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";

import { useCreateWorkspace } from "./model/use-create-workspace";

function SelectWorkspacePage() {
  const { user, workspaces, workspaceId, selectWorkspace } = useAuth();
  const { signOut, signingOut } = useSignOut();
  const createWorkspace = useCreateWorkspace();
  const [createError, setCreateError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const destination = authReturnPath(location.state);

  if (destination.startsWith("/invites/")) {
    return <Navigate replace to={destination} />;
  }
  if (workspaceId) {
    return (
      <Navigate
        replace
        to={destination === ROUTES.SELECT_WORKSPACE ? ROUTES.HOME : destination}
      />
    );
  }

  return (
    <AuthLayout>
      <WorkspaceSelection
        workspaces={workspaces}
        signingOut={signingOut}
        deletedWorkspaceName={user?.last_deleted_workspace_name ?? null}
        creatingWorkspace={createWorkspace.isPending}
        createWorkspaceError={createError}
        onSelect={(id) => {
          selectWorkspace(id);
          void navigate(destination, { replace: true });
        }}
        onSignOut={() => void signOut()}
        onCreateWorkspace={async (name) => {
          setCreateError(false);
          try {
            await createWorkspace.mutateAsync({ name, switchToNew: true });
            await navigate(destination, { replace: true });
          } catch (error) {
            setCreateError(true);
            throw error;
          }
        }}
        onCreateWorkspaceChange={() => setCreateError(false)}
      />
    </AuthLayout>
  );
}

export const Component = SelectWorkspacePage;
