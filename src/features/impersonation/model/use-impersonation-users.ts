import { useInfiniteQuery } from "@tanstack/react-query";

import {
  impersonationUsersQueryKey,
  listImpersonationUsers,
} from "../api/impersonation-api";

export function useImpersonationUsers(search: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: impersonationUsersQueryKey(search),
    queryFn: ({ pageParam }) => listImpersonationUsers(search, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce(
        (total, page) => total + page.users.length,
        0,
      );
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled,
    retry: false,
  });
}
