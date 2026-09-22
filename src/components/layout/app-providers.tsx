"use client";

import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrentUserProvider } from "@/features/auth/current-user-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <CurrentUserProvider>{children}</CurrentUserProvider>
    </TooltipProvider>
  );
}
