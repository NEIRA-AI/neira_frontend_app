import { useQuery } from "@tanstack/react-query";

import { listSessions, sessionsQueryKey } from "../api/sessions-api";

export function useSessionsList(open: boolean) {
  return useQuery({
    queryKey: sessionsQueryKey,
    queryFn: listSessions,
    enabled: open,
  });
}
