import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/generated/schema";

export type ContactDetail = components["schemas"]["ContactDetail"];
type ContactPage = components["schemas"]["ContactPage"];
type InquiryPage = components["schemas"]["InquiryPage"];

export const contactsQueryKey = (workspaceId: string) =>
  ["private", "contacts", workspaceId] as const;

export const contactQueryKey = (workspaceId: string, contactId: string) =>
  [...contactsQueryKey(workspaceId), contactId] as const;

export const contactInquiriesQueryKey = (
  workspaceId: string,
  contactId: string,
) => ["private", "inquiries", workspaceId, "contact", contactId] as const;

export async function listContacts(
  cursor: string | null,
): Promise<ContactPage> {
  const { data } = await api.get<ContactPage>("/contacts", {
    params: { limit: 50, cursor: cursor ?? undefined },
    workspace: true,
  });
  return data;
}

export async function getContact(id: string): Promise<ContactDetail> {
  const { data } = await api.get<ContactDetail>(
    `/contacts/${encodeURIComponent(id)}`,
    { workspace: true },
  );
  return data;
}

export async function listContactInquiries(
  contactId: string,
  cursor: string | null,
): Promise<InquiryPage> {
  const { data } = await api.get<InquiryPage>("/inquiries", {
    params: { contact_id: contactId, limit: 50, cursor: cursor ?? undefined },
    workspace: true,
  });
  return data;
}
