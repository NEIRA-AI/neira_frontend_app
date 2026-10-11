import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { LanguageSwitcher } from "@/features/change-language";
import { ROUTES } from "@/shared/config/routes";
import { NeiraLogo } from "@/shared/ui/logo";

interface AuthLayoutProps {
  children: ReactNode;
}

const copyright = `© NEIRA 2025${new Date().getFullYear() > 2025 ? `—${new Date().getFullYear()}` : ""}`;

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation("auth");

  return (
    <div className="min-h-[calc(100dvh-var(--impersonation-banner-height,0px))] bg-page text-ink lg:grid lg:grid-cols-2">
      <aside className="relative hidden h-[calc(100dvh-var(--impersonation-banner-height,0px))] flex-col justify-between overflow-hidden bg-auth-artwork bg-cover bg-center p-8 text-on-dark lg:sticky lg:top-0 lg:flex lg:bg-[url('/images/auth-background.png')]">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-auth-overlay/25 via-transparent to-auth-overlay" />
        <Link
          className="relative z-10 inline-flex w-24"
          to={ROUTES.HOME}
          aria-label={t("authLayout.home")}
        >
          <NeiraLogo variant="light" />
        </Link>
        <footer className="relative z-10 flex flex-col items-start gap-3 text-sm text-on-dark/80">
          <a
            className="rounded-md border border-on-dark/50 px-3 py-2 text-on-dark transition-colors hover:bg-on-dark/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
            href="https://t.me/neira_help"
            rel="noreferrer"
            target="_blank"
          >
            {t("authLayout.support")}
          </a>
          <span>{copyright}</span>
        </footer>
      </aside>

      <div className="flex min-h-[calc(100dvh-var(--impersonation-banner-height,0px))] min-w-0 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 lg:px-10">
        <header className="flex min-h-10 items-center justify-between gap-4 lg:justify-end">
          <Link
            className="inline-flex w-24 lg:hidden"
            to={ROUTES.HOME}
            aria-label={t("authLayout.home")}
          >
            <NeiraLogo variant="dark" />
          </Link>
          <LanguageSwitcher />
        </header>
        <main className="flex w-full flex-1 items-center justify-center py-10 sm:py-14">
          {children}
        </main>
        <footer className="flex items-center justify-between gap-4 text-xs text-muted lg:hidden">
          <span>{copyright}</span>
          <a href="https://t.me/neira_help" rel="noreferrer" target="_blank">
            {t("authLayout.support")}
          </a>
        </footer>
      </div>
    </div>
  );
}
