"use client";

import type { ReactNode } from "react";

import { AppShell } from "./app-shell";
import { adminNav } from "./navigation";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AppShell items={adminNav} sectionLabel="Operations">
      {children}
    </AppShell>
  );
}
