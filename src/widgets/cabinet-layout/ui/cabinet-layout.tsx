import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronsUpDown, Menu, X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router";

import { ROUTES } from "@/shared/routes";
import { Badge } from "@/shared/ui/badge";
import { MaskIcon } from "@/shared/ui/mask-icon";

import beginningIcon from "../assets/beginning.svg";
import booksIcon from "../assets/books.svg";
import channelsIcon from "../assets/channels.svg";
import collapsedLogo from "../assets/collapsed-logo.svg";
import knowledgeIcon from "../assets/knowledge.svg";
import logo from "../assets/logo.svg";
import messagesIcon from "../assets/messages.svg";
import paymentIcon from "../assets/payment.svg";
import robotIcon from "../assets/robot.svg";
import settingsIcon from "../assets/settings.svg";
import statisticIcon from "../assets/statistic.svg";

type CabinetLayoutProps = {
  children: ReactNode;
};

type SidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
  accountExpanded: boolean;
  onToggleAccount: () => void;
};

type NavigationItem = {
  icon: string;
  label: string;
  to?: string;
  dimmed?: boolean;
};

function SidebarLogo({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation("cabinet");

  return (
    <Link
      aria-label="NEIRA"
      className="flex min-w-0 items-center gap-1 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      onClick={onNavigate}
      to={ROUTES.HOME}
    >
      {collapsed ? (
        <span className="relative block size-[34px]">
          <MaskIcon
            className="absolute top-[6px] left-0 h-[21px] w-6 text-ink"
            src={collapsedLogo}
          />
          <Badge
            aria-hidden="true"
            className="absolute top-[7px] left-[25px] h-[14px] w-[9px] justify-center p-0 text-[9px] font-normal"
            tone="brand"
          >
            β
          </Badge>
        </span>
      ) : (
        <>
          <img
            alt=""
            className="h-[19px] w-20 shrink-0 dark:invert"
            height="19"
            src={logo}
            width="80"
          />
          <Badge className="h-[18px] px-1.5 py-0 font-medium" tone="brand">
            {t("beta")}
          </Badge>
        </>
      )}
    </Link>
  );
}

function SidebarNavigationItem({
  collapsed,
  item,
  onNavigate,
}: {
  collapsed: boolean;
  item: NavigationItem;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation("cabinet");
  const { dimmed, icon, label, to } = item;
  const base = collapsed
    ? "flex size-14 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    : "flex h-[41px] w-full items-center gap-3 border-l-4 border-transparent pr-3 pl-5 text-left text-[14px] font-medium leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand";
  const active = collapsed
    ? "rounded-xl bg-brand-20 text-brand"
    : "border-brand-strong bg-brand-soft text-brand-strong";
  const inactive = "text-muted-strong hover:bg-brand-soft";
  const content = (
    <>
      <MaskIcon src={icon} />
      {!collapsed && <span className="truncate">{label}</span>}
    </>
  );

  if (to) {
    return (
      <NavLink
        aria-label={collapsed ? label : undefined}
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        end={to === ROUTES.HOME}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        to={to}
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button
      aria-label={collapsed ? label : undefined}
      className={`${base} cursor-not-allowed text-muted-strong ${dimmed ? "opacity-30" : ""}`}
      disabled
      title={t("comingSoon")}
      type="button"
    >
      {content}
    </button>
  );
}

function NavigationSection({
  items,
  label,
  onNavigate,
}: {
  items: NavigationItem[];
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <section className="py-3">
      <h2 className="mb-2 px-6 text-[12px] font-medium leading-[15px] text-muted">
        {label}
      </h2>
      <div>
        {items.map((item) => (
          <SidebarNavigationItem
            key={item.label}
            collapsed={false}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}

function AccountPreview({
  collapsed,
  expanded,
  onToggle,
}: {
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation("cabinet");
  const contentId = useId();

  if (collapsed) {
    return (
      <div
        aria-label={t("accountLabel")}
        className="flex h-20 items-center justify-center"
      >
        <span className="flex size-10 items-center justify-center rounded-lg bg-brand-20 text-[23px] font-semibold text-brand-light">
          N
        </span>
      </div>
    );
  }

  return (
    <section
      className="mx-2 overflow-hidden rounded-xl border border-line bg-surface"
      aria-label={t("accountLabel")}
    >
      <button
        aria-controls={contentId}
        aria-expanded={expanded}
        aria-label={t(expanded ? "collapseAccount" : "expandAccount")}
        className="flex w-full items-center gap-2 bg-brand-soft px-3 py-3 text-left transition-colors hover:bg-brand-20 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand motion-reduce:transition-none"
        onClick={onToggle}
        type="button"
      >
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-20 text-[20px] font-semibold text-brand"
        >
          N
        </span>
        <span className="min-w-0 truncate text-[13px] font-semibold text-ink">
          {t("accountLabel")}
        </span>
        <ChevronsUpDown
          aria-hidden="true"
          className="ml-auto size-4 shrink-0 text-muted"
        />
      </button>
      <div
        aria-hidden={!expanded}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        id={contentId}
        inert={!expanded}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-3 pb-3 pt-3">
            <div aria-hidden="true" className="h-0.5 rounded-full bg-line" />
            <div className="mt-3 flex items-center justify-between gap-2 text-[11px] leading-4 text-muted">
              <span>{t("contacts")}</span>
              <span aria-label={t("notAvailable")}>—</span>
            </div>
            <button
              className="mt-3 flex h-8 w-full cursor-not-allowed items-center justify-center rounded-lg bg-brand-fill text-[12px] font-medium text-on-brand"
              disabled
              title={t("comingSoon")}
              type="button"
            >
              {t("topUp")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Sidebar({
  collapsed = false,
  onNavigate,
  accountExpanded,
  onToggleAccount,
}: SidebarProps) {
  const { t } = useTranslation("cabinet");

  const sections: { label: string; items: NavigationItem[] }[] = [
    {
      label: t("main"),
      items: [
        { label: t("home"), to: ROUTES.HOME, icon: beginningIcon },
        { label: t("statistics"), icon: statisticIcon },
        { label: t("channels"), icon: channelsIcon, dimmed: true },
      ],
    },
    {
      label: t("aiTools"),
      items: [
        { label: t("aiAgents"), icon: robotIcon, dimmed: true },
        { label: t("knowledgeBase"), icon: booksIcon },
        { label: t("messages"), icon: messagesIcon },
      ],
    },
    {
      label: t("system"),
      items: [
        { label: t("billing"), icon: paymentIcon },
        { label: t("documentation"), icon: knowledgeIcon },
        { label: t("settings"), to: ROUTES.SETTINGS, icon: settingsIcon },
      ],
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface text-ink">
      <div
        className={`flex h-20 shrink-0 items-center ${collapsed ? "justify-center" : "pl-5"}`}
      >
        <SidebarLogo collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      <nav
        aria-label={t("navigation")}
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${collapsed ? "gap-[7px] px-3 py-[35px]" : "gap-2 py-2"}`}
      >
        {collapsed
          ? sections
              .flatMap(({ items }) => items)
              .map((item) => (
                <SidebarNavigationItem
                  key={item.label}
                  collapsed
                  item={item}
                  onNavigate={onNavigate}
                />
              ))
          : sections.map(({ items, label }) => (
              <NavigationSection
                key={label}
                items={items}
                label={label}
                onNavigate={onNavigate}
              />
            ))}
      </nav>

      <div
        className={`shrink-0 ${collapsed ? "" : "pb-[calc(2rem+env(safe-area-inset-bottom))] pt-3"}`}
      >
        <AccountPreview
          collapsed={collapsed}
          expanded={accountExpanded}
          onToggle={onToggleAccount}
        />
      </div>
    </div>
  );
}

function MobileNavigation({
  accountExpanded,
  onToggleAccount,
}: Pick<SidebarProps, "accountExpanded" | "onToggleAccount">) {
  const { t } = useTranslation("cabinet");
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

const sidebarStorageKey = "neira.sidebar-collapsed";

function initialSidebarCollapsed() {
  try {
    return window.localStorage.getItem(sidebarStorageKey) === "true";
  } catch {
    return false;
  }
}

export function CabinetLayout({ children }: CabinetLayoutProps) {
  const { t } = useTranslation("cabinet");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    initialSidebarCollapsed,
  );
  const [accountExpanded, setAccountExpanded] = useState(true);

  useEffect(() => {
    try {
      window.localStorage.setItem(sidebarStorageKey, String(sidebarCollapsed));
    } catch {
      // The sidebar still responds when storage is unavailable.
    }
  }, [sidebarCollapsed]);

  return (
    <div
      className={`min-h-screen min-h-svh bg-page text-ink lg:grid lg:transition-[grid-template-columns] lg:duration-[260ms] lg:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${sidebarCollapsed ? "lg:grid-cols-[80px_minmax(0,1fr)]" : "lg:grid-cols-[220px_minmax(0,1fr)]"}`}
    >
      <aside className="group/sidebar sticky top-0 z-30 hidden h-screen h-dvh min-h-0 overflow-visible border-r border-line lg:block">
        <div className="relative h-full overflow-hidden">
          <div
            aria-hidden={sidebarCollapsed}
            className={`absolute inset-y-0 left-0 w-[220px] transition-opacity duration-150 ease-out motion-reduce:transition-none ${sidebarCollapsed ? "pointer-events-none opacity-0" : "opacity-100"}`}
            inert={sidebarCollapsed}
          >
            <Sidebar
              accountExpanded={accountExpanded}
              onToggleAccount={() => setAccountExpanded((value) => !value)}
            />
          </div>
          <div
            aria-hidden={!sidebarCollapsed}
            className={`absolute inset-y-0 left-0 w-20 transition-opacity duration-150 ease-out motion-reduce:transition-none ${sidebarCollapsed ? "opacity-100" : "pointer-events-none opacity-0"}`}
            inert={!sidebarCollapsed}
          >
            <Sidebar
              accountExpanded={accountExpanded}
              collapsed
              onToggleAccount={() => setAccountExpanded((value) => !value)}
            />
          </div>
        </div>
        <button
          aria-label={t(sidebarCollapsed ? "expandSidebar" : "collapseSidebar")}
          className="pointer-events-none absolute top-7 -right-3 z-50 flex size-6 items-center justify-center rounded-md border border-line bg-surface text-muted opacity-0 shadow-sm transition-[opacity,box-shadow,border-color] duration-200 group-hover/sidebar:pointer-events-auto group-hover/sidebar:opacity-100 hover:border-brand-20 hover:text-ink hover:shadow-md focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={() => setSidebarCollapsed((value) => !value)}
          type="button"
        >
          <ChevronLeft
            aria-hidden="true"
            className={`size-3.5 transition-transform duration-200 ${sidebarCollapsed ? "rotate-180" : ""}`}
          />
        </button>
      </aside>
      <MobileNavigation
        accountExpanded={accountExpanded}
        onToggleAccount={() => setAccountExpanded((value) => !value)}
      />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
