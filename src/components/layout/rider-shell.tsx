"use client";

import type { ReactNode } from "react";

import { AppShell } from "./app-shell";
import { riderNav } from "./navigation";

export function RiderShell({ children }: { children: ReactNode }) {
  return (
    <AppShell items={riderNav} sectionLabel="Main">
      {children}
    </AppShell>
  );
}
