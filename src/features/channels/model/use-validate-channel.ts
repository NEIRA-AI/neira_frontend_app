import { useMutation } from "@tanstack/react-query";

import { validateChannel } from "../api/channels-api";

export function useValidateChannel() {
  return useMutation({ mutationFn: validateChannel });
}
