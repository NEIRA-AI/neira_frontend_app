import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  contactQueryKey,
  contactsQueryKey,
  updateContact,
  type ContactUpdate,
} from "../api/contacts-api";

export function useUpdateContact(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ContactUpdate }) =>
      updateContact(id, request),
    onSuccess: (contact) => {
      queryClient.setQueryData(
        contactQueryKey(workspaceId, contact.id),
        contact,
      );
      void queryClient.invalidateQueries({
        queryKey: contactsQueryKey(workspaceId),
      });
    },
  });
}
