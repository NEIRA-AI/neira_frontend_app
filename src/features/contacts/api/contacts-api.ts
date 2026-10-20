import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type ContactDetail = components["schemas"]["ContactDetail"];
export type ContactSummary = components["schemas"]["ContactSummary"];
export type ContactUpdate = components["schemas"]["ContactUpdate"];
export type ContactPage = components["schemas"]["ContactPage"];
type InquiryPage = components["schemas"]["InquiryPage"];
export type ContactInquiry = components["schemas"]["InquirySummary"];

export const contactsQueryKey = (workspaceId: string) =>
  ["private", "contacts", workspaceId] as const;

export const contactListQueryKey = (workspaceId: string, search: string) =>
  [...contactsQueryKey(workspaceId), "list", search] as const;

export const contactQueryKey = (workspaceId: string, contactId: string) =>
  [...contactsQueryKey(workspaceId), "detail", contactId] as const;

export const contactInquiriesQueryPrefix = (
  workspaceId: string,
  contactId: string,
) => ["private", "inquiries", workspaceId, "contact", contactId] as const;

export const contactInquiriesQueryKey = (
  workspaceId: string,
  contactId: string,
  limit: number,
) => [...contactInquiriesQueryPrefix(workspaceId, contactId), limit] as const;

export const targetedContactInquiryQueryPrefix = (
  workspaceId: string,
  contactId: string,
) => ["private", "contact-inquiry", workspaceId, contactId] as const;

export const targetedContactInquiryQueryKey = (
  workspaceId: string,
  contactId: string,
  inquiryId: string,
) =>
  [
    ...targetedContactInquiryQueryPrefix(workspaceId, contactId),
    inquiryId,
  ] as const;

export async function listContacts(
  cursor: string | null,
  search: string,
): Promise<ContactPage> {
  const { data } = await api.get<ContactPage>("/contacts", {
    params: {
      limit: 50,
      cursor: cursor ?? undefined,
      search: search || undefined,
    },
    workspace: true,
  });
  return data;
}

export async function getContact(
  id: string,
  options?: { workspaceId?: string; signal?: AbortSignal },
): Promise<ContactDetail> {
  const { data } = await api.get<ContactDetail>(
    `/contacts/${encodeURIComponent(id)}`,
    {
      workspace: true,
      workspaceScopeId: options?.workspaceId,
      signal: options?.signal,
    },
  );
  return data;
}

export async function updateContact(
  id: string,
  request: ContactUpdate,
): Promise<ContactDetail> {
  const { data } = await api.patch<ContactDetail>(
    `/contacts/${encodeURIComponent(id)}`,
    request,
    { workspace: true },
  );
  return data;
}

export async function deleteContact(
  id: string,
  expectedRevision: number,
): Promise<void> {
  await api.delete(`/contacts/${encodeURIComponent(id)}`, {
    params: { expected_revision: expectedRevision },
    workspace: true,
  });
}

export async function listContactInquiries(
  contactId: string,
  cursor: string | null,
  limit: number,
): Promise<InquiryPage> {
  const { data } = await api.get<InquiryPage>("/inquiries", {
    params: { contact_id: contactId, limit, cursor: cursor ?? undefined },
    workspace: true,
  });
  return data;
}

export async function getTargetedContactInquiry(
  workspaceId: string,
  inquiryId: string,
  signal?: AbortSignal,
): Promise<ContactInquiry> {
  const { data } = await api.get<ContactInquiry>(
    `/inquiries/${encodeURIComponent(inquiryId)}`,
    { workspace: true, workspaceScopeId: workspaceId, signal },
  );
  return data;
}
