"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AppSidebar } from "./app-sidebar";
import { titleForPath, type NavItem } from "./navigation";
import { Topbar } from "./topbar";

type AppShellProps = {
  items: NavItem[];
  sectionLabel: string;
  children: ReactNode;
};

export function AppShell({ items, sectionLabel, children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobilePath, setMobilePath] = useState<string | null>(null);
  const mobileOpen = mobilePath === pathname;

  function setMobileOpen(open: boolean) {
    setMobilePath(open ? pathname : null);
  }

  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar
        items={items}
        sectionLabel={sectionLabel}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        className="sticky top-0 hidden md:flex"
      />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 md:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AppSidebar
            items={items}
            sectionLabel={sectionLabel}
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
            className="h-full w-full border-0"
          />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
        <Topbar
          title={titleForPath(pathname)}
          onOpenNavigation={() => setMobileOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
