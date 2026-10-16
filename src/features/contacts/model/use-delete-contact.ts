import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  contactInquiriesQueryPrefix,
  contactQueryKey,
  contactsQueryKey,
  deleteContact,
} from "../api/contacts-api";

export function useDeleteContact(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; expectedRevision: number }) =>
      deleteContact(input.id, input.expectedRevision),
    onSuccess: (_result, input) => {
      queryClient.removeQueries({
        queryKey: contactQueryKey(workspaceId, input.id),
      });
      queryClient.removeQueries({
        queryKey: contactInquiriesQueryPrefix(workspaceId, input.id),
      });
      void queryClient.invalidateQueries({
        queryKey: contactsQueryKey(workspaceId),
      });
    },
  });
}
