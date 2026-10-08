import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate, useParams } from "react-router";

import {
  invitationSignInState,
  invitationSignUpState,
  useAuth,
  type InvitationAuthDetails,
} from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

import type { InvitationPreview } from "./api/invitations-api";
import { useAcceptInvitation } from "./model/use-accept-invitation";
import { useDeclineInvitation } from "./model/use-decline-invitation";
import { useInvitation } from "./model/use-invitation";
import {
  InvitationConfirmation,
  InvitationMessage,
} from "./ui/invitation-content";
import { InvitationLayout } from "./ui/invitation-layout";

const invitationTokenPattern = /^[A-Za-z0-9._~-]{20,128}$/;

function invitationAuthDetails(
  token: string,
  invitation: InvitationPreview,
): InvitationAuthDetails {
  return {
    token,
    email: invitation.email,
    workspaceName: invitation.workspace_name,
  };
}

function ResolvedInvitation({
  status,
  showAppAction,
}: {
  status: string;
  showAppAction: boolean;
}) {
  const { t } = useTranslation("invitations");
  const copy =
    status === "expired"
      ? { title: t("expiredTitle"), description: t("expiredDescription") }
      : status === "revoked"
        ? { title: t("revokedTitle"), description: t("revokedDescription") }
        : status === "accepted"
          ? { title: t("acceptedTitle"), description: t("acceptedDescription") }
          : status === "declined"
            ? {
                title: t("declinedTitle"),
                description: t("declinedDescription"),
              }
            : {
                title: t("unavailableTitle"),
                description: t("unavailableDescription"),
              };

  return (
    <InvitationMessage
      actions={
        showAppAction ? (
          <Button asChild>
            <Link to={ROUTES.SETTINGS}>{t("toApp")}</Link>
          </Button>
        ) : undefined
      }
      description={copy.description}
      title={copy.title}
    />
  );
}

function InvitationPage() {
  const { token: routeToken } = useParams<{ token: string }>();
  const token =
    routeToken && invitationTokenPattern.test(routeToken) ? routeToken : null;
  const { t } = useTranslation("invitations");
  const navigate = useNavigate();
  const { status, user, logout, retrySession } = useAuth();
  const [switchingAccount, setSwitchingAccount] = useState(false);
  const invitationQuery = useInvitation(token);
  const accept = useAcceptInvitation(token ?? "");
  const decline = useDeclineInvitation(token ?? "");

  async function switchAccount(details: InvitationAuthDetails) {
    if (switchingAccount) return;
    setSwitchingAccount(true);
    let logoutFailed = false;
    try {
      await logout();
    } catch {
      logoutFailed = true;
    }
    void navigate(ROUTES.SIGN_IN, {
      replace: true,
      state: { ...invitationSignInState(details), logoutFailed },
    });
  }

  async function confirm() {
    try {
      await accept.mutateAsync();
      void navigate(ROUTES.SETTINGS, { replace: true });
    } catch {
      // Mutation and refreshed invitation state are rendered below.
    }
  }

  async function reject() {
    try {
      await decline.mutateAsync();
    } catch {
      // Mutation and refreshed invitation state are rendered below.
    }
  }

  let content;
  if (!token) {
    content = (
      <InvitationMessage
        description={t("invalidDescription")}
        title={t("invalidTitle")}
      />
    );
  } else if (invitationQuery.isPending) {
    content = (
      <p role="status" className="text-sm text-muted">
        {t("loading")}
      </p>
    );
  } else if (invitationQuery.isError || !invitationQuery.data) {
    const notFound =
      axios.isAxiosError(invitationQuery.error) &&
      invitationQuery.error.response?.status === 404;
    content = (
      <InvitationMessage
        actions={
          notFound ? undefined : (
            <Button onClick={() => void invitationQuery.refetch()}>
              {t("retry")}
            </Button>
          )
        }
        description={t(
          notFound ? "invalidDescription" : "loadErrorDescription",
        )}
        title={t(notFound ? "invalidTitle" : "loadErrorTitle")}
      />
    );
  } else {
    const invitation = invitationQuery.data;
    const details = invitationAuthDetails(token, invitation);

    if (invitation.status !== "pending") {
      content = (
        <ResolvedInvitation
          showAppAction={status === "authenticated"}
          status={invitation.status}
        />
      );
    } else if (status === "loading") {
      content = (
        <p role="status" className="text-sm text-muted">
          {t("loading")}
        </p>
      );
    } else if (status === "error") {
      content = (
        <InvitationMessage
          actions={<Button onClick={retrySession}>{t("retry")}</Button>}
          description={t("sessionErrorDescription")}
          title={t("sessionErrorTitle")}
        />
      );
    } else if (status === "unauthenticated") {
      return (
        <Navigate
          replace
          state={
            invitation.recipient_registered
              ? invitationSignInState(details)
              : invitationSignUpState(details)
          }
          to={invitation.recipient_registered ? ROUTES.SIGN_IN : ROUTES.SIGN_UP}
        />
      );
    } else if (
      user &&
      user.email.toLowerCase() !== invitation.email.toLowerCase()
    ) {
      content = (
        <InvitationMessage
          actions={
            <Button
              disabled={switchingAccount}
              onClick={() => void switchAccount(details)}
            >
              {switchingAccount ? t("switchingAccount") : t("switchAccount")}
            </Button>
          }
          description={t("emailMismatchDescription", {
            invitedEmail: invitation.email,
            currentEmail: user.email,
          })}
          title={t("emailMismatchTitle")}
        />
      );
    } else if (user) {
      content = (
        <InvitationConfirmation
          accepting={accept.isPending}
          actionError={accept.isError || decline.isError}
          declining={decline.isPending}
          invitation={invitation}
          onAccept={() => void confirm()}
          onDecline={() => void reject()}
          user={user}
        />
      );
    } else {
      content = (
        <InvitationMessage
          actions={<Button onClick={retrySession}>{t("retry")}</Button>}
          description={t("sessionErrorDescription")}
          title={t("sessionErrorTitle")}
        />
      );
    }
  }

  return <InvitationLayout>{content}</InvitationLayout>;
}

export const Component = InvitationPage;
