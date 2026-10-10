import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router";
import { Bell, ListFilter, UsersRound, type LucideIcon } from "lucide-react";

import { useAuth } from "@/features/auth";
import { useUnreadChatCount } from "@/features/chats";
import { useUnreadNotificationCount } from "@/features/notifications";
import channelsIcon from "@/shared/assets/channels.svg";
import { ROUTES } from "@/shared/config/routes";
import { Badge } from "@/shared/ui/badge";
import { MaskIcon } from "@/shared/ui/mask-icon";

import beginningIcon from "../assets/beginning.svg";
import booksIcon from "../assets/books.svg";
import collapsedLogo from "../assets/collapsed-logo.svg";
import knowledgeIcon from "../assets/knowledge.svg";
import logo from "../assets/logo.svg";
import messagesIcon from "../assets/messages.svg";
import paymentIcon from "../assets/payment.svg";
import robotIcon from "../assets/robot.svg";
import settingsIcon from "../assets/settings.svg";
import statisticIcon from "../assets/statistic.svg";

import { AccountCard } from "./account-card";

export type SidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
  accountExpanded: boolean;
  onToggleAccount: () => void;
};

type NavigationItem = {
  icon: string | LucideIcon;
  label: string;
  to?: string;
  dimmed?: boolean;
  unreadCount?: number;
  unreadLabel?: string;
};

function NavigationIcon({ icon }: { icon: NavigationItem["icon"] }) {
  if (typeof icon === "string") return <MaskIcon src={icon} />;
  const Icon = icon;
  return <Icon aria-hidden="true" className="size-5 shrink-0" />;
}

export function SidebarLogo({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation("dashboard");

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
  const { t } = useTranslation("dashboard");
  const { dimmed, icon, label, to, unreadCount = 0, unreadLabel } = item;
  const base = collapsed
    ? "relative flex size-14 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    : "flex h-[41px] w-full items-center gap-3 border-l-4 border-transparent pr-3 pl-5 text-left text-[14px] font-medium leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand";
  const active = collapsed
    ? "rounded-xl bg-brand-20 text-brand"
    : "border-brand-strong bg-brand-soft text-brand-strong";
  const inactive = "text-muted-strong hover:bg-brand-soft";
  const content = (
    <>
      <NavigationIcon icon={icon} />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
      {unreadCount > 0 && (
        <Badge
          aria-label={unreadLabel}
          className={
            collapsed
              ? "absolute right-0 top-0 min-w-4 justify-center px-1 py-0.5 text-[10px]"
              : "ml-auto min-w-5 justify-center px-1.5 py-1 text-[11px]"
          }
          tone="brand"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </>
  );

  if (to) {
    return (
      <NavLink
        aria-label={
          collapsed
            ? unreadCount > 0
              ? `${label}, ${unreadLabel}`
              : label
            : undefined
        }
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

export function Sidebar({
  collapsed = false,
  onNavigate,
  accountExpanded,
  onToggleAccount,
}: SidebarProps) {
  const { t } = useTranslation("dashboard");
  const { user, workspaceId } = useAuth();
  const workspaceUnread = useUnreadNotificationCount(
    user?.id ?? "",
    "workspace",
    workspaceId,
  );
  const personalUnread = useUnreadNotificationCount(
    user?.id ?? "",
    "personal",
    workspaceId,
  );
  const unreadChats = useUnreadChatCount(workspaceId ?? "");

  const sections: { label: string; items: NavigationItem[] }[] = [
    {
      label: t("main"),
      items: [
        { label: t("home"), to: ROUTES.HOME, icon: beginningIcon },
        { label: t("statistics"), icon: statisticIcon },
        { label: t("channels"), to: ROUTES.CHANNELS, icon: channelsIcon },
        { label: t("contactDirectory"), to: ROUTES.CONTACTS, icon: UsersRound },
        { label: t("funnels"), to: ROUTES.FUNNELS, icon: ListFilter },
      ],
    },
    {
      label: t("aiTools"),
      items: [
        { label: t("aiAgents"), icon: robotIcon, dimmed: true },
        { label: t("knowledgeBase"), icon: booksIcon },
        {
          label: t("messages"),
          to: ROUTES.MESSAGES,
          icon: messagesIcon,
          unreadCount: unreadChats.data ?? 0,
          unreadLabel: t("unreadMessages", { count: unreadChats.data ?? 0 }),
        },
      ],
    },
    {
      label: t("system"),
      items: [
        { label: t("billing"), icon: paymentIcon },
        { label: t("documentation"), icon: knowledgeIcon },
        {
          label: t("notifications"),
          to: ROUTES.NOTIFICATIONS,
          icon: Bell,
          unreadCount: (workspaceUnread.data ?? 0) + (personalUnread.data ?? 0),
          unreadLabel: t("unreadNotifications", {
            count: (workspaceUnread.data ?? 0) + (personalUnread.data ?? 0),
          }),
        },
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
        <AccountCard
          collapsed={collapsed}
          expanded={accountExpanded}
          onToggle={onToggleAccount}
        />
      </div>
    </div>
  );
}
