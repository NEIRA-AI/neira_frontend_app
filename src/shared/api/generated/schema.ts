// Сгенерировано из OpenAPI. Не редактировать вручную.
export interface paths {
  "/health/live": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Live */
    get: operations["live_health_live_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/health/ready": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Ready */
    get: operations["ready_health_ready_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/register": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Register */
    post: operations["register_api_v1_auth_register_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/verify-email": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Verify Email */
    post: operations["verify_email_api_v1_auth_verify_email_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/verify-email/resend": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Resend Email Verification */
    post: operations["resend_email_verification_api_v1_auth_verify_email_resend_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/password-reset/request": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Request Password Reset */
    post: operations["request_password_reset_api_v1_auth_password_reset_request_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/password-reset/confirm": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Confirm Password Reset */
    post: operations["confirm_password_reset_api_v1_auth_password_reset_confirm_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/login": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Login */
    post: operations["login_api_v1_auth_login_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/login/2fa": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Finish Two Factor Login */
    post: operations["finish_two_factor_login_api_v1_auth_login_2fa_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/2fa": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Two Factor Status */
    get: operations["two_factor_status_api_v1_auth_2fa_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/2fa/setup": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Start Two Factor Setup */
    post: operations["start_two_factor_setup_api_v1_auth_2fa_setup_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/2fa/confirm": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Confirm Two Factor Setup */
    post: operations["confirm_two_factor_setup_api_v1_auth_2fa_confirm_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/2fa/disable": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Disable Two Factor */
    post: operations["disable_two_factor_api_v1_auth_2fa_disable_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/2fa/backup-codes/regenerate": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Regenerate Backup Codes */
    post: operations["regenerate_backup_codes_api_v1_auth_2fa_backup_codes_regenerate_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/refresh": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Refresh */
    post: operations["refresh_api_v1_auth_refresh_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/impersonation/authorize": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Authorize Impersonation */
    post: operations["authorize_impersonation_api_v1_auth_impersonation_authorize_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/impersonation/users": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Impersonation Targets */
    get: operations["list_impersonation_targets_api_v1_auth_impersonation_users_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/impersonation/start": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Start Impersonation */
    post: operations["start_impersonation_api_v1_auth_impersonation_start_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/impersonation/stop": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Stop Impersonation */
    post: operations["stop_impersonation_api_v1_auth_impersonation_stop_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/logout": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Logout */
    post: operations["logout_api_v1_auth_logout_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/me": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Me */
    get: operations["me_api_v1_auth_me_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Update Me */
    patch: operations["update_me_api_v1_auth_me_patch"];
    trace?: never;
  };
  "/api/v1/auth/me/avatar": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Upload Avatar */
    post: operations["upload_avatar_api_v1_auth_me_avatar_post"];
    /** Delete Avatar */
    delete: operations["delete_avatar_api_v1_auth_me_avatar_delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/change-password": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Change Password */
    post: operations["change_password_api_v1_auth_change_password_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/sessions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Sessions */
    get: operations["list_sessions_api_v1_auth_sessions_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/sessions/{session_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Revoke Session */
    delete: operations["revoke_session_api_v1_auth_sessions__session_id__delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/sessions/revoke-others": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Revoke Other Sessions */
    post: operations["revoke_other_sessions_api_v1_auth_sessions_revoke_others_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/workspaces": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Workspaces */
    get: operations["list_workspaces_api_v1_workspaces_get"];
    put?: never;
    /** Create Workspace */
    post: operations["create_workspace_api_v1_workspaces_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/workspaces/{workspace_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete Workspace */
    delete: operations["delete_workspace_api_v1_workspaces__workspace_id__delete"];
    options?: never;
    head?: never;
    /** Rename Workspace */
    patch: operations["rename_workspace_api_v1_workspaces__workspace_id__patch"];
    trace?: never;
  };
  "/api/v1/workspaces/current": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Current Workspace */
    get: operations["current_workspace_api_v1_workspaces_current_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/invitations/{token}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Invitation */
    get: operations["get_invitation_api_v1_invitations__token__get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/invitations/{token}/accept": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Accept Invitation */
    post: operations["accept_invitation_api_v1_invitations__token__accept_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/invitations/{token}/decline": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Decline Invitation */
    post: operations["decline_invitation_api_v1_invitations__token__decline_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/workspaces/{workspace_id}/members": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Workspace People */
    get: operations["list_workspace_people_api_v1_workspaces__workspace_id__members_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/workspaces/{workspace_id}/invitations": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create Invitation */
    post: operations["create_invitation_api_v1_workspaces__workspace_id__invitations_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/workspaces/{workspace_id}/invitations/{invitation_id}/renew": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Renew Invitation */
    post: operations["renew_invitation_api_v1_workspaces__workspace_id__invitations__invitation_id__renew_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/workspaces/{workspace_id}/invitations/{invitation_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Revoke Invitation */
    delete: operations["revoke_invitation_api_v1_workspaces__workspace_id__invitations__invitation_id__delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/workspaces/{workspace_id}/members/{user_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Remove Member */
    delete: operations["remove_member_api_v1_workspaces__workspace_id__members__user_id__delete"];
    options?: never;
    head?: never;
    /** Change Member Role */
    patch: operations["change_member_role_api_v1_workspaces__workspace_id__members__user_id__patch"];
    trace?: never;
  };
  "/api/v1/workspaces/{workspace_id}/members/me": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Leave Workspace */
    delete: operations["leave_workspace_api_v1_workspaces__workspace_id__members_me_delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/channels/validate": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Validate Channel */
    post: operations["validate_channel_api_v1_channels_validate_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/channels": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Channels */
    get: operations["list_channels_api_v1_channels_get"];
    put?: never;
    /** Create Channel */
    post: operations["create_channel_api_v1_channels_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/channels/{channel_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Channel */
    get: operations["get_channel_api_v1_channels__channel_id__get"];
    put?: never;
    post?: never;
    /** Delete Channel */
    delete: operations["delete_channel_api_v1_channels__channel_id__delete"];
    options?: never;
    head?: never;
    /** Update Channel */
    patch: operations["update_channel_api_v1_channels__channel_id__patch"];
    trace?: never;
  };
  "/api/v1/channels/{channel_id}/events": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Channel Events */
    get: operations["list_channel_events_api_v1_channels__channel_id__events_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/channels/{channel_id}/events/{event_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Channel Event */
    get: operations["get_channel_event_api_v1_channels__channel_id__events__event_id__get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/channels/{channel_id}/check": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Check Channel */
    post: operations["check_channel_api_v1_channels__channel_id__check_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/channels/{channel_id}/refresh": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Refresh Channel */
    post: operations["refresh_channel_api_v1_channels__channel_id__refresh_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/channels/{channel_id}/disconnect": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Disconnect Channel */
    post: operations["disconnect_channel_api_v1_channels__channel_id__disconnect_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/channels/{channel_id}/reconnect": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Reconnect Channel */
    post: operations["reconnect_channel_api_v1_channels__channel_id__reconnect_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/contacts": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Contacts */
    get: operations["list_contacts_api_v1_contacts_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/contacts/{contact_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Contact */
    get: operations["get_contact_api_v1_contacts__contact_id__get"];
    put?: never;
    post?: never;
    /** Delete Contact */
    delete: operations["delete_contact_api_v1_contacts__contact_id__delete"];
    options?: never;
    head?: never;
    /** Update Contact */
    patch: operations["update_contact_api_v1_contacts__contact_id__patch"];
    trace?: never;
  };
  "/api/v1/funnels": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Funnels */
    get: operations["list_funnels_api_v1_funnels_get"];
    put?: never;
    /** Create Funnel */
    post: operations["create_funnel_api_v1_funnels_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/funnels/{funnel_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Funnel */
    get: operations["get_funnel_api_v1_funnels__funnel_id__get"];
    put?: never;
    post?: never;
    /** Delete Funnel */
    delete: operations["delete_funnel_api_v1_funnels__funnel_id__delete"];
    options?: never;
    head?: never;
    /** Update Funnel */
    patch: operations["update_funnel_api_v1_funnels__funnel_id__patch"];
    trace?: never;
  };
  "/api/v1/funnels/{funnel_id}/deletion-impact": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Funnel Deletion Impact */
    get: operations["get_funnel_deletion_impact_api_v1_funnels__funnel_id__deletion_impact_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/funnels/{funnel_id}/statuses": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Add Status */
    post: operations["add_status_api_v1_funnels__funnel_id__statuses_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/funnels/{funnel_id}/statuses/{status_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete Status */
    delete: operations["delete_status_api_v1_funnels__funnel_id__statuses__status_id__delete"];
    options?: never;
    head?: never;
    /** Update Status */
    patch: operations["update_status_api_v1_funnels__funnel_id__statuses__status_id__patch"];
    trace?: never;
  };
  "/api/v1/funnels/{funnel_id}/statuses/order": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Reorder Statuses */
    put: operations["reorder_statuses_api_v1_funnels__funnel_id__statuses_order_put"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/funnels/{funnel_id}/statuses/{status_id}/make-entry": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Make Entry */
    post: operations["make_entry_api_v1_funnels__funnel_id__statuses__status_id__make_entry_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/inquiries": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Inquiries */
    get: operations["list_inquiries_api_v1_inquiries_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/inquiries/{inquiry_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Inquiry */
    get: operations["get_inquiry_api_v1_inquiries__inquiry_id__get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/inquiries/{inquiry_id}/status": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Update Inquiry Status */
    patch: operations["update_inquiry_status_api_v1_inquiries__inquiry_id__status_patch"];
    trace?: never;
  };
  "/api/v1/inquiries/{inquiry_id}/state": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Update Inquiry State */
    patch: operations["update_inquiry_state_api_v1_inquiries__inquiry_id__state_patch"];
    trace?: never;
  };
  "/api/v1/conversations": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Conversations */
    get: operations["list_conversations_api_v1_conversations_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/unread-count": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Unread Conversation Messages */
    get: operations["unread_conversation_messages_api_v1_conversations_unread_count_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/notification-settings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Conversation Notification Settings */
    get: operations["list_conversation_notification_settings_api_v1_conversations_notification_settings_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/stream": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Stream Conversations */
    get: operations["stream_conversations_api_v1_conversations_stream_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Conversation */
    get: operations["get_conversation_api_v1_conversations__conversation_id__get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}/notification-settings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Patch Conversation Notification Settings */
    patch: operations["patch_conversation_notification_settings_api_v1_conversations__conversation_id__notification_settings_patch"];
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}/messages": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Messages */
    get: operations["list_messages_api_v1_conversations__conversation_id__messages_get"];
    put?: never;
    /** Send Message */
    post: operations["send_message_api_v1_conversations__conversation_id__messages_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}/messages/{message_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Message */
    get: operations["get_message_api_v1_conversations__conversation_id__messages__message_id__get"];
    put?: never;
    post?: never;
    /** Cancel Failed Message */
    delete: operations["cancel_failed_message_api_v1_conversations__conversation_id__messages__message_id__delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}/messages/{message_id}/revisions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Message Revisions */
    get: operations["get_message_revisions_api_v1_conversations__conversation_id__messages__message_id__revisions_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}/messages/{message_id}/author": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Message Author */
    get: operations["get_message_author_api_v1_conversations__conversation_id__messages__message_id__author_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}/messages/photo": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Send Photo */
    post: operations["send_photo_api_v1_conversations__conversation_id__messages_photo_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}/messages/file": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Send File */
    post: operations["send_file_api_v1_conversations__conversation_id__messages_file_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}/messages/media": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Send Media */
    post: operations["send_media_api_v1_conversations__conversation_id__messages_media_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}/messages/{message_id}/retry": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Retry Failed Message */
    post: operations["retry_failed_message_api_v1_conversations__conversation_id__messages__message_id__retry_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}/failed-messages": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Failed Messages */
    get: operations["list_failed_messages_api_v1_conversations__conversation_id__failed_messages_get"];
    put?: never;
    post?: never;
    /** Cancel All Failed Messages */
    delete: operations["cancel_all_failed_messages_api_v1_conversations__conversation_id__failed_messages_delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/conversations/{conversation_id}/read": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Mark Messages Read */
    post: operations["mark_messages_read_api_v1_conversations__conversation_id__read_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/notifications": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Notifications */
    get: operations["list_notifications_api_v1_notifications_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/notifications/unread-count": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Unread Count */
    get: operations["unread_count_api_v1_notifications_unread_count_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/notifications/stream": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Stream Notifications */
    get: operations["stream_notifications_api_v1_notifications_stream_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/notifications/read": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Mark Selected Read */
    patch: operations["mark_selected_read_api_v1_notifications_read_patch"];
    trace?: never;
  };
  "/api/v1/notifications/bulk-delete": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Delete Selected */
    post: operations["delete_selected_api_v1_notifications_bulk_delete_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/notifications/{notification_id}/read": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Mark Read */
    patch: operations["mark_read_api_v1_notifications__notification_id__read_patch"];
    trace?: never;
  };
  "/api/v1/notifications/{notification_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete Notification */
    delete: operations["delete_notification_api_v1_notifications__notification_id__delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/events/state": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Current Change State */
    get: operations["current_change_state_api_v1_events_state_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/events/stream": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Stream Changes */
    get: operations["stream_changes_api_v1_events_stream_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** AvatarResponse */
    AvatarResponse: {
      /** Avatar Url */
      avatar_url: string;
    };
    /** BackupCodesResponse */
    BackupCodesResponse: {
      /** Backup Codes */
      backup_codes: string[];
    };
    /** Body_send_file_api_v1_conversations__conversation_id__messages_file_post */
    Body_send_file_api_v1_conversations__conversation_id__messages_file_post: {
      /** File */
      file: string;
      /**
       * Client Message Id
       * Format: uuid
       */
      client_message_id: string;
      /**
       * Caption
       * @default
       */
      caption: string;
    };
    /** Body_send_media_api_v1_conversations__conversation_id__messages_media_post */
    Body_send_media_api_v1_conversations__conversation_id__messages_media_post: {
      /** Attachments */
      attachments: string[];
      /** Attachment Kinds */
      attachment_kinds: ("photo" | "file")[];
      /**
       * Client Message Id
       * Format: uuid
       */
      client_message_id: string;
      /**
       * Caption
       * @default
       */
      caption: string;
    };
    /** Body_send_photo_api_v1_conversations__conversation_id__messages_photo_post */
    Body_send_photo_api_v1_conversations__conversation_id__messages_photo_post: {
      /** Photo */
      photo: string;
      /**
       * Client Message Id
       * Format: uuid
       */
      client_message_id: string;
      /**
       * Caption
       * @default
       */
      caption: string;
    };
    /** Body_upload_avatar_api_v1_auth_me_avatar_post */
    Body_upload_avatar_api_v1_auth_me_avatar_post: {
      /** File */
      file: string;
    };
    /** ChangePasswordRequest */
    ChangePasswordRequest: {
      /** Current Password */
      current_password: string;
      /** New Password */
      new_password: string;
    };
    /** ChannelCreate */
    ChannelCreate: {
      /**
       * Provider
       * @enum {string}
       */
      provider: "telegram_bot" | "vk_community";
      /** Token */
      token: string;
      /** Group Id */
      group_id?: number | null;
      /** Name */
      name?: string | null;
      /** Funnel Id */
      funnel_id?: string | null;
    };
    /** ChannelEventDetailRead */
    ChannelEventDetailRead: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Provider Event Id */
      provider_event_id: string;
      /** Event Type */
      event_type: string;
      /** Connection Id */
      connection_id: string | null;
      /** Funnel Id At Receipt */
      funnel_id_at_receipt: string | null;
      /**
       * Received At
       * Format: date-time
       */
      received_at: string;
      /**
       * Processing Status
       * @enum {string}
       */
      processing_status:
        "pending" | "processed" | "unsupported" | "failed" | "legacy";
      /** Attempt Count */
      attempt_count: number;
      /** Next Attempt At */
      next_attempt_at: string | null;
      /** Processed At */
      processed_at: string | null;
      /** Last Error Code */
      last_error_code: string | null;
      /** Payload */
      payload: {
        [key: string]: unknown;
      };
    };
    /** ChannelEventPageRead */
    ChannelEventPageRead: {
      /** Items */
      items: components["schemas"]["ChannelEventRead"][];
      /** Next Cursor */
      next_cursor: string | null;
    };
    /** ChannelEventRead */
    ChannelEventRead: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Provider Event Id */
      provider_event_id: string;
      /** Event Type */
      event_type: string;
      /** Connection Id */
      connection_id: string | null;
      /** Funnel Id At Receipt */
      funnel_id_at_receipt: string | null;
      /**
       * Received At
       * Format: date-time
       */
      received_at: string;
      /**
       * Processing Status
       * @enum {string}
       */
      processing_status:
        "pending" | "processed" | "unsupported" | "failed" | "legacy";
      /** Attempt Count */
      attempt_count: number;
      /** Next Attempt At */
      next_attempt_at: string | null;
      /** Processed At */
      processed_at: string | null;
      /** Last Error Code */
      last_error_code: string | null;
    };
    /** ChannelRead */
    ChannelRead: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Workspace Id
       * Format: uuid
       */
      workspace_id: string;
      /**
       * Provider
       * @enum {string}
       */
      provider: "telegram_bot" | "vk_community";
      /** External Id */
      external_id: string;
      /** Name */
      name: string;
      /** Profile */
      profile: {
        [key: string]: unknown;
      };
      /** Funnel Id */
      funnel_id: string | null;
      /**
       * Status
       * @enum {string}
       */
      status: "active" | "disconnected" | "needs_reconnect" | "pending";
      /** Last Checked At */
      last_checked_at: string | null;
      /** Last Error Code */
      last_error_code: string | null;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /** ChannelReconnect */
    ChannelReconnect: {
      /** Token */
      token: string;
    };
    /** ChannelUpdate */
    ChannelUpdate: {
      /** Name */
      name?: string | null;
      /** Funnel Id */
      funnel_id?: string | null;
    };
    /** ChannelValidate */
    ChannelValidate: {
      /**
       * Provider
       * @enum {string}
       */
      provider: "telegram_bot" | "vk_community";
      /** Token */
      token: string;
      /** Group Id */
      group_id?: number | null;
    };
    /** ChannelValidationRead */
    ChannelValidationRead: {
      /**
       * Provider
       * @enum {string}
       */
      provider: "telegram_bot" | "vk_community";
      /** External Id */
      external_id: string;
      /** Profile */
      profile: {
        [key: string]: unknown;
      };
    };
    /** ContactConversationRead */
    ContactConversationRead: {
      /** Provider */
      provider: string;
      /**
       * Identity Id
       * Format: uuid
       */
      identity_id: string;
      /**
       * Conversation Id
       * Format: uuid
       */
      conversation_id: string;
      /** Channel Id */
      channel_id: string | null;
      /** Url */
      url: string;
    };
    /** ContactDetail */
    ContactDetail: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Revision */
      revision: number;
      /** Display Name */
      display_name: string;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /**
       * Updated At
       * Format: date-time
       */
      updated_at: string;
      /** Providers */
      providers: string[];
      /** Last Seen At */
      last_seen_at: string | null;
      /** Email */
      email: string | null;
      /** Phone */
      phone: string | null;
      /** Avatar Url */
      avatar_url: string | null;
      /** Conversations */
      conversations: components["schemas"]["ContactConversationRead"][];
      /** Identities */
      identities: components["schemas"]["ExternalIdentityRead"][];
    };
    /** ContactPage */
    ContactPage: {
      /** Items */
      items: components["schemas"]["ContactSummary"][];
      /** Next Cursor */
      next_cursor: string | null;
    };
    /** ContactSummary */
    ContactSummary: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Revision */
      revision: number;
      /** Display Name */
      display_name: string;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /**
       * Updated At
       * Format: date-time
       */
      updated_at: string;
      /** Providers */
      providers: string[];
      /** Last Seen At */
      last_seen_at: string | null;
      /** Email */
      email: string | null;
      /** Phone */
      phone: string | null;
      /** Avatar Url */
      avatar_url: string | null;
      /** Conversations */
      conversations: components["schemas"]["ContactConversationRead"][];
    };
    /** ContactUpdate */
    ContactUpdate: {
      /** Expected Revision */
      expected_revision: number;
      /** Display Name */
      display_name?: string | null;
      /** Email */
      email?: string | null;
      /** Phone */
      phone?: string | null;
    };
    /** ConversationCancelResult */
    ConversationCancelResult: {
      /** Cancelled Count */
      cancelled_count: number;
    };
    /** ConversationChannelAuthor */
    ConversationChannelAuthor: {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      kind: "channel";
      /** Id */
      id: string | null;
      /** Display Name */
      display_name: string;
      /** Avatar Url */
      avatar_url: string | null;
      /** Channel Name */
      channel_name: string | null;
      /** Provider */
      provider: string | null;
      /** External Id */
      external_id: string | null;
      /** Status */
      status: string | null;
      /** Username */
      username: string | null;
      /** Profile Url */
      profile_url: string | null;
      /** Archived */
      archived: boolean;
    };
    /** ConversationFailedMessagePage */
    ConversationFailedMessagePage: {
      /** Items */
      items: string[];
      /** Next Cursor */
      next_cursor: string | null;
    };
    /** ConversationMessage */
    ConversationMessage: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Conversation Id
       * Format: uuid
       */
      conversation_id: string;
      /** Sequence */
      sequence: number;
      /** Direction */
      direction: string;
      /** Author Name */
      author_name: string | null;
      /** Author User Id */
      author_user_id: string | null;
      /** Author Contact Id */
      author_contact_id: string | null;
      /** Author External Identity Id */
      author_external_identity_id: string | null;
      /** Author Avatar Url */
      author_avatar_url: string | null;
      /** Delivery Status */
      delivery_status: string | null;
      /** Delivery Error Code */
      delivery_error_code: string | null;
      /**
       * Occurred At
       * Format: date-time
       */
      occurred_at: string;
      /** Edited At */
      edited_at: string | null;
      /** Parts */
      parts: components["schemas"]["ConversationMessagePart"][];
    };
    /**
     * ConversationMessageAuthor
     * @description The persisted outgoing author's details, scoped by its message.
     */
    ConversationMessageAuthor:
      | components["schemas"]["ConversationChannelAuthor"]
      | components["schemas"]["ConversationUserAuthor"];
    /** ConversationMessagePage */
    ConversationMessagePage: {
      /** Items */
      items: components["schemas"]["ConversationMessage"][];
      /** Next Cursor */
      next_cursor: string | null;
    };
    /** ConversationMessagePart */
    ConversationMessagePart: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Position */
      position: number;
      /** Kind */
      kind: string;
      /** Text */
      text: string | null;
      /** Media Type */
      media_type: string | null;
      /** Size Bytes */
      size_bytes: number | null;
      /** File Name */
      file_name: string | null;
      /** Duration Seconds */
      duration_seconds: number | null;
      /** Width */
      width: number | null;
      /** Height */
      height: number | null;
      /** Media Url */
      media_url: string | null;
      /** Media Url Expires At */
      media_url_expires_at: string | null;
    };
    /** ConversationMessageRevision */
    ConversationMessageRevision: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Revision No */
      revision_no: number;
      /**
       * Changed At
       * Format: date-time
       */
      changed_at: string;
      /** Is Current */
      is_current: boolean;
      /** Parts */
      parts: components["schemas"]["ConversationMessageRevisionPart"][];
    };
    /** ConversationMessageRevisionPage */
    ConversationMessageRevisionPage: {
      /** Items */
      items: components["schemas"]["ConversationMessageRevision"][];
      /** Next Cursor */
      next_cursor: number | null;
    };
    /** ConversationMessageRevisionPart */
    ConversationMessageRevisionPart: {
      /** Position */
      position: number;
      /** Kind */
      kind: string;
      /** Text */
      text: string | null;
      /** Media Type */
      media_type: string | null;
      /** Size Bytes */
      size_bytes: number | null;
      /** File Name */
      file_name: string | null;
      /** Duration Seconds */
      duration_seconds: number | null;
      /** Width */
      width: number | null;
      /** Height */
      height: number | null;
    };
    /** ConversationNotificationSettings */
    ConversationNotificationSettings: {
      /**
       * Conversation Id
       * Format: uuid
       */
      conversation_id: string;
      /** Sound Enabled */
      sound_enabled: boolean;
      /** Notifications Enabled */
      notifications_enabled: boolean;
    };
    /** ConversationNotificationSettingsPage */
    ConversationNotificationSettingsPage: {
      /** Items */
      items: components["schemas"]["ConversationNotificationSettings"][];
    };
    /** ConversationNotificationSettingsPatch */
    ConversationNotificationSettingsPatch: {
      /** Sound Enabled */
      sound_enabled?: boolean | null;
      /** Notifications Enabled */
      notifications_enabled?: boolean | null;
    };
    /** ConversationPage */
    ConversationPage: {
      /** Items */
      items: components["schemas"]["ConversationSummary"][];
      /** Next Cursor */
      next_cursor: string | null;
    };
    /** ConversationReadRequest */
    ConversationReadRequest: {
      /** Message Ids */
      message_ids: string[];
    };
    /** ConversationReadResult */
    ConversationReadResult: {
      /** Unread Count */
      unread_count: number;
      /** Changed */
      changed: boolean;
    };
    /** ConversationSendRequest */
    ConversationSendRequest: {
      /** Text */
      text: string;
      /**
       * Client Message Id
       * Format: uuid
       */
      client_message_id: string;
    };
    /** ConversationSummary */
    ConversationSummary: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Kind */
      kind: string;
      /** Title */
      title: string;
      /** Avatar Url */
      avatar_url: string | null;
      /** Contact Id */
      contact_id: string | null;
      /** Primary External Identity Id */
      primary_external_identity_id: string | null;
      /** Profile Url */
      profile_url: string | null;
      /** Channel Id */
      channel_id: string | null;
      /** Channel Provider */
      channel_provider: string | null;
      /**
       * Updated At
       * Format: date-time
       */
      updated_at: string;
      /** Unread Count */
      unread_count: number;
      last_message: components["schemas"]["ConversationMessage"] | null;
    };
    /** ConversationUnreadCount */
    ConversationUnreadCount: {
      /** Unread Count */
      unread_count: number;
    };
    /** ConversationUserAuthor */
    ConversationUserAuthor: {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      kind: "user";
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Display Name */
      display_name: string;
      /** Avatar Url */
      avatar_url: string | null;
      /** Email */
      email: string | null;
      /** Telegram */
      telegram: string | null;
      /** Workspace Role */
      workspace_role: string | null;
    };
    /** CurrentWorkspaceResponse */
    CurrentWorkspaceResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Role */
      role: string;
    };
    /** EmailCodeRequest */
    EmailCodeRequest: {
      /**
       * Email
       * Format: email
       */
      email: string;
      /** Code */
      code: string;
    };
    /** EmailRequest */
    EmailRequest: {
      /**
       * Email
       * Format: email
       */
      email: string;
    };
    /** EmailVerificationResponse */
    EmailVerificationResponse: {
      /**
       * Verified
       * @default true
       * @constant
       */
      verified: true;
      /** Invitation Status */
      invitation_status?: ("accepted" | "unavailable") | null;
    };
    /** ExternalIdentityRead */
    ExternalIdentityRead: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Provider */
      provider: string;
      /** External User Id */
      external_user_id: string;
      /** Display Name */
      display_name: string;
      /**
       * Last Seen At
       * Format: date-time
       */
      last_seen_at: string;
      /** Avatar Url */
      avatar_url: string | null;
      /** Profile Url */
      profile_url: string | null;
      /** Provider Dialog Url */
      provider_dialog_url: string | null;
      /** Profile Data */
      profile_data: {
        [key: string]: unknown;
      };
      /** Profile Refreshed At */
      profile_refreshed_at: string | null;
      /** Platform Conversations */
      platform_conversations: components["schemas"]["ContactConversationRead"][];
    };
    /** FunnelCreate */
    FunnelCreate: {
      /** Name */
      name: string;
      /** Statuses */
      statuses: components["schemas"]["StatusCreate"][];
    };
    /** FunnelDeletionImpact */
    FunnelDeletionImpact: {
      /** Active Channels */
      active_channels: components["schemas"]["LinkedChannelRead"][];
    };
    /** FunnelRead */
    FunnelRead: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Workspace Id
       * Format: uuid
       */
      workspace_id: string;
      /** Name */
      name: string;
      /** Statuses */
      statuses: components["schemas"]["StatusRead"][];
    };
    /** FunnelStatusDraft */
    FunnelStatusDraft: {
      /** Name */
      name: string;
      /** Description */
      description?: string | null;
      /**
       * Color
       * @default violet
       * @enum {string}
       */
      color:
        | "violet"
        | "blue"
        | "cyan"
        | "mint"
        | "amber"
        | "coral"
        | "pink"
        | "slate";
      /** Id */
      id?: string | null;
    };
    /** FunnelUpdate */
    FunnelUpdate: {
      /** Name */
      name: string;
      /** Statuses */
      statuses?: components["schemas"]["FunnelStatusDraft"][] | null;
    };
    /** HTTPValidationError */
    HTTPValidationError: {
      /** Detail */
      detail?: components["schemas"]["ValidationError"][];
    };
    /** ImpersonationActor */
    ImpersonationActor: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Email */
      email: string;
    };
    /** ImpersonationAuthorizeRequest */
    ImpersonationAuthorizeRequest: {
      /** Current Password */
      current_password: string;
    };
    /** ImpersonationStartRequest */
    ImpersonationStartRequest: {
      /**
       * Target User Id
       * Format: uuid
       */
      target_user_id: string;
    };
    /** ImpersonationTarget */
    ImpersonationTarget: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Email */
      email: string;
      /** Avatar Url */
      avatar_url: string;
      /** Email Verified */
      email_verified: boolean;
    };
    /** ImpersonationTargetsResponse */
    ImpersonationTargetsResponse: {
      /** Users */
      users: components["schemas"]["ImpersonationTarget"][];
      /** Total */
      total: number;
    };
    /** InquiryPage */
    InquiryPage: {
      /** Items */
      items: components["schemas"]["InquirySummary"][];
      /** Next Cursor */
      next_cursor: string | null;
      /** Status Counts */
      status_counts: {
        [key: string]: number;
      };
    };
    /** InquiryStateUpdate */
    InquiryStateUpdate: {
      /**
       * State
       * @enum {string}
       */
      state: "open" | "closed";
      /** Expected Revision */
      expected_revision: number;
    };
    /** InquiryStatusUpdate */
    InquiryStatusUpdate: {
      /**
       * Status Id
       * Format: uuid
       */
      status_id: string;
      /** Expected Revision */
      expected_revision: number;
    };
    /** InquirySummary */
    InquirySummary: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Revision */
      revision: number;
      /**
       * Contact Id
       * Format: uuid
       */
      contact_id: string;
      /** Contact Name */
      contact_name: string;
      /**
       * Funnel Id
       * Format: uuid
       */
      funnel_id: string;
      /** Funnel Name */
      funnel_name: string;
      /**
       * Status Id
       * Format: uuid
       */
      status_id: string;
      /** Status Name */
      status_name: string;
      /** State */
      state: string;
      /**
       * Opened At
       * Format: date-time
       */
      opened_at: string;
      /** Closed At */
      closed_at: string | null;
      /** Last Message Text */
      last_message_text: string | null;
    };
    /** InvitationCreateRequest */
    InvitationCreateRequest: {
      /**
       * Email
       * Format: email
       */
      email: string;
      /**
       * Role
       * @enum {string}
       */
      role: "admin" | "manager" | "reader";
    };
    /** InvitationPublicResponse */
    InvitationPublicResponse: {
      /** Workspace Name */
      workspace_name: string;
      /** Email */
      email: string;
      /** Role */
      role: string;
      /** Status */
      status: string;
      /**
       * Expires At
       * Format: date-time
       */
      expires_at: string;
      /** Recipient Registered */
      recipient_registered: boolean;
    };
    /** InvitationSummary */
    InvitationSummary: {
      /** Workspace Name */
      workspace_name: string;
      /** Email */
      email: string;
      /** Role */
      role: string;
      /** Status */
      status: string;
      /**
       * Expires At
       * Format: date-time
       */
      expires_at: string;
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Token */
      token: string;
      /**
       * Workspace Id
       * Format: uuid
       */
      workspace_id: string;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /** Recipient Existing User Id */
      recipient_existing_user_id?: string | null;
      /** Recipient Name */
      recipient_name?: string | null;
    };
    /** LinkedChannelRead */
    LinkedChannelRead: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
    };
    /** LoginRequest */
    LoginRequest: {
      /**
       * Email
       * Format: email
       */
      email: string;
      /** Password */
      password: string;
    };
    /** LoginTwoFactorRequest */
    LoginTwoFactorRequest: {
      /** Challenge Token */
      challenge_token: string;
      /** Code */
      code: string;
    };
    /** MeResponse */
    MeResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Email */
      email: string;
      /** Telegram */
      telegram: string | null;
      /** Avatar Url */
      avatar_url: string;
      /** Platform Role */
      platform_role: string;
      /** Email Verified */
      email_verified: boolean;
      /** Workspaces */
      workspaces: components["schemas"]["WorkspaceSummary"][];
      /** Last Deleted Workspace Name */
      last_deleted_workspace_name?: string | null;
      impersonation?: components["schemas"]["ImpersonationActor"] | null;
    };
    /** MemberRoleRequest */
    MemberRoleRequest: {
      /**
       * Role
       * @enum {string}
       */
      role: "admin" | "manager" | "reader";
    };
    /** MemberSummary */
    MemberSummary: {
      /**
       * User Id
       * Format: uuid
       */
      user_id: string;
      /** Name */
      name: string;
      /** Email */
      email: string;
      /** Role */
      role: string;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /** MembersResponse */
    MembersResponse: {
      /** Members */
      members: components["schemas"]["MemberSummary"][];
      /** Invitations */
      invitations: components["schemas"]["InvitationSummary"][];
    };
    /** NotificationList */
    NotificationList: {
      /** Items */
      items: components["schemas"]["NotificationRead"][];
      /** Unread Count */
      unread_count: number;
      /** Next Cursor */
      next_cursor: string | null;
    };
    /** NotificationRead */
    NotificationRead: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Kind */
      kind: string;
      /** Title */
      title: string;
      /** Description */
      description: string;
      /** Target Path */
      target_path: string;
      /** Read At */
      read_at: string | null;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /** NotificationSelection */
    NotificationSelection: {
      /** Ids */
      ids: string[];
    };
    /** PasswordResetConfirmRequest */
    PasswordResetConfirmRequest: {
      /**
       * Email
       * Format: email
       */
      email: string;
      /** Code */
      code: string;
      /** New Password */
      new_password: string;
    };
    /** ProfileUpdateRequest */
    ProfileUpdateRequest: {
      /** Name */
      name: string;
      /** Telegram */
      telegram: string | null;
    };
    /** RegisterRequest */
    RegisterRequest: {
      /** Name */
      name: string;
      /**
       * Email
       * Format: email
       */
      email: string;
      /** Telegram */
      telegram?: string | null;
      /** Password */
      password: string;
      /**
       * Accepted Terms
       * @constant
       */
      accepted_terms: true;
      /**
       * Accepted Privacy
       * @constant
       */
      accepted_privacy: true;
      /** Invitation Token */
      invitation_token?: string | null;
    };
    /** RegistrationPendingResponse */
    RegistrationPendingResponse: {
      /** Email */
      email: string;
      /**
       * Verification Required
       * @default true
       * @constant
       */
      verification_required: true;
    };
    /** SessionSummary */
    SessionSummary: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** User Agent */
      user_agent: string | null;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /**
       * Last Seen At
       * Format: date-time
       */
      last_seen_at: string;
      /**
       * Expires At
       * Format: date-time
       */
      expires_at: string;
      /** Current */
      current: boolean;
    };
    /** SessionsResponse */
    SessionsResponse: {
      /** Sessions */
      sessions: components["schemas"]["SessionSummary"][];
    };
    /** StatusCreate */
    StatusCreate: {
      /** Name */
      name: string;
      /** Description */
      description?: string | null;
      /**
       * Color
       * @default violet
       * @enum {string}
       */
      color:
        | "violet"
        | "blue"
        | "cyan"
        | "mint"
        | "amber"
        | "coral"
        | "pink"
        | "slate";
    };
    /** StatusOrder */
    StatusOrder: {
      /** Status Ids */
      status_ids: string[];
    };
    /** StatusRead */
    StatusRead: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Description */
      description: string | null;
      /**
       * Color
       * @enum {string}
       */
      color:
        | "violet"
        | "blue"
        | "cyan"
        | "mint"
        | "amber"
        | "coral"
        | "pink"
        | "slate";
      /** Position */
      position: number;
      /** Is Entry */
      is_entry: boolean;
    };
    /** StatusUpdate */
    StatusUpdate: {
      /** Name */
      name?: string | null;
      /** Description */
      description?: string | null;
      /** Color */
      color?:
        | (
            | "violet"
            | "blue"
            | "cyan"
            | "mint"
            | "amber"
            | "coral"
            | "pink"
            | "slate"
          )
        | null;
    };
    /** TokenResponse */
    TokenResponse: {
      /** Access Token */
      access_token: string;
      /**
       * Token Type
       * @default bearer
       * @constant
       */
      token_type: "bearer";
    };
    /** TwoFactorChallengeResponse */
    TwoFactorChallengeResponse: {
      /**
       * Two Factor Required
       * @default true
       * @constant
       */
      two_factor_required: true;
      /** Challenge Token */
      challenge_token: string;
      /**
       * Expires In
       * @default 300
       */
      expires_in: number;
    };
    /** TwoFactorConfirmRequest */
    TwoFactorConfirmRequest: {
      /** Code */
      code: string;
    };
    /** TwoFactorProtectedRequest */
    TwoFactorProtectedRequest: {
      /** Code */
      code: string;
      /** Current Password */
      current_password: string;
    };
    /** TwoFactorSetupRequest */
    TwoFactorSetupRequest: {
      /** Current Password */
      current_password: string;
    };
    /** TwoFactorSetupResponse */
    TwoFactorSetupResponse: {
      /** Secret */
      secret: string;
      /** Otpauth Uri */
      otpauth_uri: string;
    };
    /** TwoFactorStatusResponse */
    TwoFactorStatusResponse: {
      /** Enabled */
      enabled: boolean;
      /** Backup Codes Remaining */
      backup_codes_remaining: number;
    };
    /** UnreadCount */
    UnreadCount: {
      /** Count */
      count: number;
    };
    /** ValidationError */
    ValidationError: {
      /** Location */
      loc: (string | number)[];
      /** Message */
      msg: string;
      /** Error Type */
      type: string;
      /** Input */
      input?: unknown;
      /** Context */
      ctx?: Record<string, never>;
    };
    /** WorkspaceNameRequest */
    WorkspaceNameRequest: {
      /** Name */
      name: string;
    };
    /** WorkspaceSummary */
    WorkspaceSummary: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Role */
      role: string;
    };
    /** WorkspacesResponse */
    WorkspacesResponse: {
      /** Workspaces */
      workspaces: components["schemas"]["WorkspaceSummary"][];
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  live_health_live_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            [key: string]: string;
          };
        };
      };
    };
  };
  ready_health_ready_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            [key: string]: string;
          };
        };
      };
    };
  };
  register_api_v1_auth_register_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RegisterRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RegistrationPendingResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  verify_email_api_v1_auth_verify_email_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["EmailCodeRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["EmailVerificationResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  resend_email_verification_api_v1_auth_verify_email_resend_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["EmailRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            [key: string]: string;
          };
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  request_password_reset_api_v1_auth_password_reset_request_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["EmailRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            [key: string]: string;
          };
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  confirm_password_reset_api_v1_auth_password_reset_confirm_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PasswordResetConfirmRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  login_api_v1_auth_login_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["LoginRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json":
            | components["schemas"]["TokenResponse"]
            | components["schemas"]["TwoFactorChallengeResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  finish_two_factor_login_api_v1_auth_login_2fa_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["LoginTwoFactorRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["TokenResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  two_factor_status_api_v1_auth_2fa_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["TwoFactorStatusResponse"];
        };
      };
    };
  };
  start_two_factor_setup_api_v1_auth_2fa_setup_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["TwoFactorSetupRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["TwoFactorSetupResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  confirm_two_factor_setup_api_v1_auth_2fa_confirm_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["TwoFactorConfirmRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["BackupCodesResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  disable_two_factor_api_v1_auth_2fa_disable_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["TwoFactorProtectedRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  regenerate_backup_codes_api_v1_auth_2fa_backup_codes_regenerate_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["TwoFactorProtectedRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["BackupCodesResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  refresh_api_v1_auth_refresh_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["TokenResponse"];
        };
      };
    };
  };
  authorize_impersonation_api_v1_auth_impersonation_authorize_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ImpersonationAuthorizeRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_impersonation_targets_api_v1_auth_impersonation_users_get: {
    parameters: {
      query?: {
        search?: string | null;
        limit?: number;
        offset?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ImpersonationTargetsResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  start_impersonation_api_v1_auth_impersonation_start_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ImpersonationStartRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["TokenResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  stop_impersonation_api_v1_auth_impersonation_stop_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["TokenResponse"];
        };
      };
    };
  };
  logout_api_v1_auth_logout_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  me_api_v1_auth_me_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["MeResponse"];
        };
      };
    };
  };
  update_me_api_v1_auth_me_patch: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ProfileUpdateRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["MeResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  upload_avatar_api_v1_auth_me_avatar_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "multipart/form-data": components["schemas"]["Body_upload_avatar_api_v1_auth_me_avatar_post"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AvatarResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_avatar_api_v1_auth_me_avatar_delete: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  change_password_api_v1_auth_change_password_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ChangePasswordRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Incorrect current password */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_sessions_api_v1_auth_sessions_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["SessionsResponse"];
        };
      };
    };
  };
  revoke_session_api_v1_auth_sessions__session_id__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        session_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  revoke_other_sessions_api_v1_auth_sessions_revoke_others_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  list_workspaces_api_v1_workspaces_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkspacesResponse"];
        };
      };
    };
  };
  create_workspace_api_v1_workspaces_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["WorkspaceNameRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkspaceSummary"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_workspace_api_v1_workspaces__workspace_id__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workspace_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  rename_workspace_api_v1_workspaces__workspace_id__patch: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workspace_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["WorkspaceNameRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkspaceSummary"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  current_workspace_api_v1_workspaces_current_get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CurrentWorkspaceResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_invitation_api_v1_invitations__token__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        token: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InvitationPublicResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  accept_invitation_api_v1_invitations__token__accept_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        token: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  decline_invitation_api_v1_invitations__token__decline_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        token: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_workspace_people_api_v1_workspaces__workspace_id__members_get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workspace_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["MembersResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  create_invitation_api_v1_workspaces__workspace_id__invitations_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workspace_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["InvitationCreateRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InvitationSummary"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  renew_invitation_api_v1_workspaces__workspace_id__invitations__invitation_id__renew_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workspace_id: string;
        invitation_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InvitationSummary"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  revoke_invitation_api_v1_workspaces__workspace_id__invitations__invitation_id__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workspace_id: string;
        invitation_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  remove_member_api_v1_workspaces__workspace_id__members__user_id__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workspace_id: string;
        user_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  change_member_role_api_v1_workspaces__workspace_id__members__user_id__patch: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workspace_id: string;
        user_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["MemberRoleRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["MemberSummary"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  leave_workspace_api_v1_workspaces__workspace_id__members_me_delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workspace_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  validate_channel_api_v1_channels_validate_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ChannelValidate"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ChannelValidationRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_channels_api_v1_channels_get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ChannelRead"][];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  create_channel_api_v1_channels_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ChannelCreate"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ChannelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_channel_api_v1_channels__channel_id__get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        channel_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ChannelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_channel_api_v1_channels__channel_id__delete: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        channel_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_channel_api_v1_channels__channel_id__patch: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        channel_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ChannelUpdate"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ChannelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_channel_events_api_v1_channels__channel_id__events_get: {
    parameters: {
      query?: {
        limit?: number;
        cursor?: string | null;
      };
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        channel_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ChannelEventPageRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_channel_event_api_v1_channels__channel_id__events__event_id__get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        channel_id: string;
        event_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ChannelEventDetailRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  check_channel_api_v1_channels__channel_id__check_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        channel_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ChannelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  refresh_channel_api_v1_channels__channel_id__refresh_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        channel_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ChannelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  disconnect_channel_api_v1_channels__channel_id__disconnect_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        channel_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ChannelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  reconnect_channel_api_v1_channels__channel_id__reconnect_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        channel_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ChannelReconnect"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ChannelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_contacts_api_v1_contacts_get: {
    parameters: {
      query?: {
        limit?: number;
        cursor?: string | null;
        search?: string | null;
      };
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ContactPage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_contact_api_v1_contacts__contact_id__get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        contact_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ContactDetail"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_contact_api_v1_contacts__contact_id__delete: {
    parameters: {
      query: {
        expected_revision: number;
      };
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        contact_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_contact_api_v1_contacts__contact_id__patch: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        contact_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ContactUpdate"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ContactDetail"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_funnels_api_v1_funnels_get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["FunnelRead"][];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  create_funnel_api_v1_funnels_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["FunnelCreate"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["FunnelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_funnel_api_v1_funnels__funnel_id__get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        funnel_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["FunnelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_funnel_api_v1_funnels__funnel_id__delete: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        funnel_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_funnel_api_v1_funnels__funnel_id__patch: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        funnel_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["FunnelUpdate"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["FunnelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_funnel_deletion_impact_api_v1_funnels__funnel_id__deletion_impact_get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        funnel_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["FunnelDeletionImpact"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  add_status_api_v1_funnels__funnel_id__statuses_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        funnel_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["StatusCreate"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["FunnelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_status_api_v1_funnels__funnel_id__statuses__status_id__delete: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        funnel_id: string;
        status_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_status_api_v1_funnels__funnel_id__statuses__status_id__patch: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        funnel_id: string;
        status_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["StatusUpdate"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["FunnelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  reorder_statuses_api_v1_funnels__funnel_id__statuses_order_put: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        funnel_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["StatusOrder"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["FunnelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  make_entry_api_v1_funnels__funnel_id__statuses__status_id__make_entry_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        funnel_id: string;
        status_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["FunnelRead"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_inquiries_api_v1_inquiries_get: {
    parameters: {
      query?: {
        funnel_id?: string | null;
        contact_id?: string | null;
        state?: ("open" | "closed") | null;
        limit?: number;
        cursor?: string | null;
      };
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InquiryPage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_inquiry_api_v1_inquiries__inquiry_id__get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        inquiry_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InquirySummary"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_inquiry_status_api_v1_inquiries__inquiry_id__status_patch: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        inquiry_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["InquiryStatusUpdate"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InquirySummary"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_inquiry_state_api_v1_inquiries__inquiry_id__state_patch: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        inquiry_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["InquiryStateUpdate"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InquirySummary"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_conversations_api_v1_conversations_get: {
    parameters: {
      query?: {
        limit?: number;
        cursor?: string | null;
      };
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationPage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  unread_conversation_messages_api_v1_conversations_unread_count_get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationUnreadCount"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_conversation_notification_settings_api_v1_conversations_notification_settings_get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationNotificationSettingsPage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  stream_conversations_api_v1_conversations_stream_get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_conversation_api_v1_conversations__conversation_id__get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationSummary"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  patch_conversation_notification_settings_api_v1_conversations__conversation_id__notification_settings_patch: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ConversationNotificationSettingsPatch"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationNotificationSettings"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_messages_api_v1_conversations__conversation_id__messages_get: {
    parameters: {
      query?: {
        limit?: number;
        cursor?: string | null;
      };
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationMessagePage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  send_message_api_v1_conversations__conversation_id__messages_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ConversationSendRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationMessage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_message_api_v1_conversations__conversation_id__messages__message_id__get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
        message_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationMessage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  cancel_failed_message_api_v1_conversations__conversation_id__messages__message_id__delete: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
        message_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_message_revisions_api_v1_conversations__conversation_id__messages__message_id__revisions_get: {
    parameters: {
      query?: {
        limit?: number;
        before_revision?: number | null;
      };
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
        message_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationMessageRevisionPage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_message_author_api_v1_conversations__conversation_id__messages__message_id__author_get: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
        message_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationMessageAuthor"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  send_photo_api_v1_conversations__conversation_id__messages_photo_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "multipart/form-data": components["schemas"]["Body_send_photo_api_v1_conversations__conversation_id__messages_photo_post"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationMessage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  send_file_api_v1_conversations__conversation_id__messages_file_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "multipart/form-data": components["schemas"]["Body_send_file_api_v1_conversations__conversation_id__messages_file_post"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationMessage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  send_media_api_v1_conversations__conversation_id__messages_media_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "multipart/form-data": components["schemas"]["Body_send_media_api_v1_conversations__conversation_id__messages_media_post"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationMessage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  retry_failed_message_api_v1_conversations__conversation_id__messages__message_id__retry_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
        message_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationMessage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_failed_messages_api_v1_conversations__conversation_id__failed_messages_get: {
    parameters: {
      query?: {
        limit?: number;
        cursor?: string | null;
      };
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationFailedMessagePage"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  cancel_all_failed_messages_api_v1_conversations__conversation_id__failed_messages_delete: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationCancelResult"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  mark_messages_read_api_v1_conversations__conversation_id__read_post: {
    parameters: {
      query?: never;
      header: {
        "X-Neira-Workspace-Id": string;
      };
      path: {
        conversation_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ConversationReadRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ConversationReadResult"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_notifications_api_v1_notifications_get: {
    parameters: {
      query?: {
        search?: string | null;
        read?: "all" | "read" | "unread";
        sort?: "newest" | "oldest";
        limit?: number;
        cursor?: string | null;
        scope?: "workspace" | "personal";
      };
      header?: {
        "X-Neira-Workspace-Id"?: string | null;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["NotificationList"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  unread_count_api_v1_notifications_unread_count_get: {
    parameters: {
      query?: {
        scope?: "workspace" | "personal";
      };
      header?: {
        "X-Neira-Workspace-Id"?: string | null;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["UnreadCount"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  stream_notifications_api_v1_notifications_stream_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": unknown;
        };
      };
    };
  };
  mark_selected_read_api_v1_notifications_read_patch: {
    parameters: {
      query?: {
        scope?: "workspace" | "personal";
      };
      header?: {
        "X-Neira-Workspace-Id"?: string | null;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["NotificationSelection"];
      };
    };
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_selected_api_v1_notifications_bulk_delete_post: {
    parameters: {
      query?: {
        scope?: "workspace" | "personal";
      };
      header?: {
        "X-Neira-Workspace-Id"?: string | null;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["NotificationSelection"];
      };
    };
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  mark_read_api_v1_notifications__notification_id__read_patch: {
    parameters: {
      query?: {
        scope?: "workspace" | "personal";
      };
      header?: {
        "X-Neira-Workspace-Id"?: string | null;
      };
      path: {
        notification_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_notification_api_v1_notifications__notification_id__delete: {
    parameters: {
      query?: {
        scope?: "workspace" | "personal";
      };
      header?: {
        "X-Neira-Workspace-Id"?: string | null;
      };
      path: {
        notification_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  current_change_state_api_v1_events_state_get: {
    parameters: {
      query?: never;
      header?: {
        "X-Neira-Workspace-Id"?: string | null;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            [key: string]: number | null;
          };
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  stream_changes_api_v1_events_stream_get: {
    parameters: {
      query?: never;
      header?: {
        "X-Neira-Workspace-Id"?: string | null;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
}
