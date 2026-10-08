import type { ReactNode } from "react";
import { Link } from "react-router";

import { LanguageSwitcher } from "@/features/change-language";
import { ROUTES } from "@/shared/config/routes";
import { NeiraLogo } from "@/shared/ui/logo";

export function InvitationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-page px-4 py-5 text-ink sm:px-8">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
        <Link to={ROUTES.HOME}>
          <NeiraLogo />
        </Link>
        <LanguageSwitcher />
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center py-10">
        {children}
      </main>
    </div>
  );
}
