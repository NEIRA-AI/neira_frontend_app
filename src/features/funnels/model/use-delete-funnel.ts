import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteFunnel } from "../api/funnels-api";

export function useDeleteFunnel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFunnel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["private"] }),
  });
}
