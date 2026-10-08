import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";

import { MobileNavigation } from "./mobile-navigation";
import { Sidebar } from "./sidebar";

const sidebarStorageKey = "neira.sidebar-collapsed";

function initialSidebarCollapsed() {
  try {
    return window.localStorage.getItem(sidebarStorageKey) === "true";
  } catch {
    return false;
  }
}

export function DashboardLayout() {
  const { t } = useTranslation("dashboard");
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
      className={`min-h-svh bg-page text-ink lg:grid lg:transition-[grid-template-columns] lg:duration-260 lg:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${sidebarCollapsed ? "lg:grid-cols-[80px_minmax(0,1fr)]" : "lg:grid-cols-[220px_minmax(0,1fr)]"}`}
    >
      <aside className="group/sidebar sticky top-0 z-30 hidden h-dvh min-h-0 overflow-visible border-r border-line lg:block">
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
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export const Component = DashboardLayout;
