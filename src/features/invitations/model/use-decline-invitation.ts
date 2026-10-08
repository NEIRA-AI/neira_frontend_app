import { useMutation, useQueryClient } from "@tanstack/react-query";

import { declineInvitation } from "../api/invitations-api";
import { invitationQueryKey } from "./use-invitation";

export function useDeclineInvitation(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => declineInvitation(token),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: invitationQueryKey(token),
      });
    },
  });
}
