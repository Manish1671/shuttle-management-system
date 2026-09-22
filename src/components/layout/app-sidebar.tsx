"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { initials, roleLabel } from "@/features/auth/demo-users";
import { useCurrentUser } from "@/features/auth/current-user-provider";
import { cn } from "@/lib/utils";

import { isNavItemActive, type NavItem } from "./navigation";

type AppSidebarProps = {
  items: NavItem[];
  sectionLabel: string;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  className?: string;
};

export function AppSidebar({
  items,
  sectionLabel,
  collapsed,
  onToggleCollapse,
  onNavigate,
  className,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useCurrentUser();

  return (
    <aside
      className={cn(
        "flex h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        collapsed ? "w-[4.5rem]" : "w-64",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2 border-b border-sidebar-border px-3",
          collapsed && "justify-center px-2",
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Bus className="size-4" aria-hidden="true" />
        </span>
        {collapsed ? null : (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">CampusRide</span>
            <span className="block truncate text-xs text-muted-foreground">
              Smart Campus Transit
            </span>
          </span>
        )}
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-2 py-4">
        {collapsed ? null : (
          <p className="px-2 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {sectionLabel}
          </p>
        )}
        <ul className="space-y-1">
          {items.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            const Icon = item.icon;
            const link = (
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                    : "hover:bg-muted",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
              </Link>
            );

            return (
              <li key={item.href}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  link
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto border-t border-sidebar-border p-3">
        {user ? (
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar size="sm">
              <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            {collapsed ? null : (
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {roleLabel(user)}
                </span>
              </span>
            )}
          </div>
        ) : null}
        <Separator className="my-3" />
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-full"
                aria-label="Switch account"
                onClick={logout}
              >
                <LogOut aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Switch account</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut aria-hidden="true" />
            Switch account
          </Button>
        )}
        {onToggleCollapse ? (
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={cn("mt-2 w-full", collapsed && "px-0")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={onToggleCollapse}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose aria-hidden="true" />
                Collapse
              </>
            )}
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
