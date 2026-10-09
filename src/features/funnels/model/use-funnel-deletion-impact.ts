import { useQuery } from "@tanstack/react-query";

import { getFunnelDeletionImpact } from "../api/funnels-api";

export function useFunnelDeletionImpact(workspaceId: string, funnelId: string) {
  return useQuery({
    queryKey: ["private", "funnels", workspaceId, funnelId, "deletion-impact"],
    queryFn: () => getFunnelDeletionImpact(funnelId),
    refetchOnMount: "always",
  });
}
