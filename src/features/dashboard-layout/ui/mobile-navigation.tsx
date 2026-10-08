import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Sidebar, SidebarLogo, type SidebarProps } from "./sidebar";

export function MobileNavigation({
  accountExpanded,
  onToggleAccount,
}: Pick<SidebarProps, "accountExpanded" | "onToggleAccount">) {
  const { t } = useTranslation("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <Dialog.Root onOpenChange={setMenuOpen} open={menuOpen}>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-surface px-4 sm:px-6 lg:hidden">
        <SidebarLogo />
        <Dialog.Trigger asChild>
          <button
            aria-label={t("openMenu")}
            className="flex size-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            type="button"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
        </Dialog.Trigger>
      </header>

      <Dialog.Portal>
        <Dialog.Overlay className="mobile-menu-overlay fixed inset-0 z-40 bg-overlay lg:hidden" />
        <Dialog.Content className="mobile-menu-panel fixed left-0 top-0 z-50 h-screen h-dvh w-[min(220px,calc(100vw-3rem))] border-r border-line bg-surface shadow-xl focus:outline-none lg:hidden">
          <Dialog.Title className="sr-only">{t("navigation")}</Dialog.Title>
          <Sidebar
            accountExpanded={accountExpanded}
            onNavigate={() => setMenuOpen(false)}
            onToggleAccount={onToggleAccount}
          />
          <Dialog.Close asChild>
            <button
              aria-label={t("closeMenu")}
              className="absolute right-2 top-6 flex size-9 items-center justify-center rounded-lg bg-surface text-muted hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
