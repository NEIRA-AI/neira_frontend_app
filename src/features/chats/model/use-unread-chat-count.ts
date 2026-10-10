import { useQuery } from "@tanstack/react-query";

import {
  getUnreadChatCount,
  unreadChatCountQueryKey,
} from "../api/conversations-api";

export function useUnreadChatCount(workspaceId: string) {
  return useQuery({
    queryKey: unreadChatCountQueryKey(workspaceId),
    queryFn: getUnreadChatCount,
    enabled: Boolean(workspaceId),
  });
}
