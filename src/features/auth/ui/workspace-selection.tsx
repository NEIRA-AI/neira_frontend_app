import { ArrowRight, Bell, Building2, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { workspaceDisplayName } from "@/shared/lib/workspace-display-name";

import type { WorkspaceMembership } from "../api/auth-api";
import { AuthPageHeading } from "./auth-page-heading";

interface WorkspaceSelectionProps {
  workspaces: WorkspaceMembership[];
  signingOut: boolean;
  deletedWorkspaceName: string | null;
  creatingWorkspace: boolean;
  createWorkspaceError: boolean;
  onSelect: (id: string) => void;
  onSignOut: () => void;
  onCreateWorkspace: (name: string) => Promise<void>;
  onCreateWorkspaceChange: () => void;
}

export function WorkspaceSelection({
  workspaces,
  signingOut,
  deletedWorkspaceName,
  creatingWorkspace,
  createWorkspaceError,
  onSelect,
  onSignOut,
  onCreateWorkspace,
  onCreateWorkspaceChange,
}: WorkspaceSelectionProps) {
  const { t } = useTranslation("auth");
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [nameInvalid, setNameInvalid] = useState(false);

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creatingWorkspace) return;
    const normalizedName = name.trim();
    if (!normalizedName || normalizedName.length > 120) {
      setNameInvalid(true);
      return;
    }
    void onCreateWorkspace(normalizedName).catch(() => {
      // The request error is displayed beside the form.
    });
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <AuthPageHeading
        description={
          workspaces.length
            ? t("workspaceSelect.description")
            : t("workspaceSelect.emptyDescription")
        }
        title={
          workspaces.length
            ? t("workspaceSelect.title")
            : t("workspaceSelect.emptyTitle")
        }
      />

      {workspaces.length > 0 ? (
        <ul className="space-y-3" aria-label={t("workspaceSelect.listLabel")}>
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <Button
                className="min-h-16 w-full justify-between gap-4 px-5 text-left text-base font-semibold"
                onClick={() => onSelect(workspace.id)}
                variant="outline"
              >
                <span className="min-w-0 truncate">
                  {workspaceDisplayName(workspace, workspaces)}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-5 shrink-0 text-muted"
                />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-line bg-surface px-5 py-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Building2 aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-4 text-sm leading-6 text-muted">
            {deletedWorkspaceName
              ? t("workspaceSelect.deletedWorkspace", {
                  workspace: deletedWorkspaceName,
                })
              : t("workspaceSelect.empty")}
          </p>

          {showCreate ? (
            <form
              className="mt-6 space-y-3 text-left"
              noValidate
              onSubmit={submitCreate}
            >
              <label
                className="block text-sm font-medium text-ink"
                htmlFor="own-workspace-name"
              >
                {t("workspaceSelect.nameLabel")}
              </label>
              <Input
                aria-invalid={nameInvalid}
                autoFocus
                disabled={creatingWorkspace}
                id="own-workspace-name"
                maxLength={120}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameInvalid(false);
                  onCreateWorkspaceChange();
                }}
                placeholder={t("workspaceSelect.namePlaceholder")}
                value={name}
              />
              {nameInvalid && (
                <p className="text-sm text-danger" role="alert">
                  {t("workspaceSelect.nameRequired")}
                </p>
              )}
              {createWorkspaceError && (
                <p className="text-sm text-danger" role="alert">
                  {t("workspaceSelect.createError")}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  disabled={creatingWorkspace}
                  type="submit"
                >
                  {creatingWorkspace
                    ? t("workspaceSelect.creating")
                    : t("workspaceSelect.createSubmit")}
                </Button>
                <Button
                  disabled={creatingWorkspace}
                  onClick={() => {
                    setShowCreate(false);
                    setName("");
                    setNameInvalid(false);
                    onCreateWorkspaceChange();
                  }}
                  variant="outline"
                >
                  {t("workspaceSelect.cancel")}
                </Button>
              </div>
            </form>
          ) : (
            <Button className="mt-6" onClick={() => setShowCreate(true)}>
              <Plus aria-hidden="true" className="size-4" />
              {t("workspaceSelect.createOwn")}
            </Button>
          )}
          <Button asChild className="mx-auto mt-3 flex" variant="ghost">
            <Link to={ROUTES.NOTIFICATIONS}>
              <Bell aria-hidden="true" className="size-4" />
              {t("workspaceSelect.notifications")}
            </Link>
          </Button>
        </div>
      )}

      <Button
        className="mx-auto flex text-muted"
        disabled={signingOut}
        onClick={onSignOut}
        variant="ghost"
      >
        {t("workspaceSelect.signOut")}
      </Button>
    </div>
  );
}
