import { useQuery } from "@tanstack/react-query";

import {
  getMessageAuthor,
  messageAuthorQueryKey,
} from "../api/conversations-api";

export function useMessageAuthor(
  workspaceId: string,
  conversationId: string,
  messageId: string,
) {
  return useQuery({
    queryKey: messageAuthorQueryKey(workspaceId, conversationId, messageId),
    queryFn: () => getMessageAuthor(conversationId, messageId),
    enabled: Boolean(workspaceId && conversationId && messageId),
  });
}
