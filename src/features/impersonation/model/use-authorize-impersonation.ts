import { useMutation } from "@tanstack/react-query";

import { authorizeImpersonation } from "../api/impersonation-api";

export function useAuthorizeImpersonation() {
  return useMutation({ mutationFn: authorizeImpersonation });
}
