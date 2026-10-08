import { useMutation, useQueryClient } from "@tanstack/react-query";

import { changePassword } from "../api/change-password-api";
import { sessionsQueryKey } from "../api/sessions-api";

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey }),
  });
}
