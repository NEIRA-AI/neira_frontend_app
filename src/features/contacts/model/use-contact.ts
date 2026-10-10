import { useQuery } from "@tanstack/react-query";

import { contactQueryKey, getContact } from "../api/contacts-api";

export function useContact(workspaceId: string, contactId: string) {
  return useQuery({
    queryKey: contactQueryKey(workspaceId, contactId),
    queryFn: () => getContact(contactId),
    enabled: Boolean(workspaceId && contactId),
  });
}
