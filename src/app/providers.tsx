import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { AuthProvider, refreshSession } from "@/features/auth";
import { ChatNotifications } from "@/features/chats";
import { installAuthInterceptors } from "@/shared/api/auth-interceptors";

import { RealtimeClient } from "./realtime-client";

installAuthInterceptors(refreshSession);
const queryClient = new QueryClient();
queryClient.setQueryDefaults(["private"], { refetchOnWindowFocus: false });

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatNotifications>
          <RealtimeClient />
          {children}
        </ChatNotifications>
      </AuthProvider>
    </QueryClientProvider>
  );
}
