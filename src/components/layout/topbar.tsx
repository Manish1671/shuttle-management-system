"use client";

import { Menu } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials, roleLabel } from "@/features/auth/demo-users";
import { useCurrentUser } from "@/features/auth/current-user-provider";

type TopbarProps = {
  title: string;
  onOpenNavigation: () => void;
};

export function Topbar({ title, onOpenNavigation }: TopbarProps) {
  const { user, logout } = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={onOpenNavigation}
      >
        <Menu aria-hidden="true" />
      </Button>
      <h1 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight">
        {title}
      </h1>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 gap-2 px-2"
              aria-label={`Account menu for ${user.name}`}
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-4">{user.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {roleLabel(user)}
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block text-sm font-medium">{user.name}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {roleLabel(user)} · {user.id}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout}>Switch account</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </header>
  );
}
