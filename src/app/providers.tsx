import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { AuthProvider, refreshSession } from "@/features/auth";
import { NotificationStream } from "@/features/notifications";
import { installAuthInterceptors } from "@/shared/api/auth-interceptors";

installAuthInterceptors(refreshSession);
const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationStream />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
