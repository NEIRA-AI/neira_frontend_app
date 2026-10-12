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
    mutationFn: deleteContact,
    onSuccess: (_result, id) => {
      queryClient.removeQueries({
        queryKey: contactQueryKey(workspaceId, id),
      });
      queryClient.removeQueries({
        queryKey: contactInquiriesQueryPrefix(workspaceId, id),
      });
      void queryClient.invalidateQueries({
        queryKey: contactsQueryKey(workspaceId),
      });
    },
  });
}
