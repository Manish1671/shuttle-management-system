import type { ReactNode } from "react";

import { RiderShell } from "@/components/layout/rider-shell";
import { RoleGuard } from "@/components/layout/role-guard";

export default function RiderLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="rider">
      <RiderShell>{children}</RiderShell>
    </RoleGuard>
  );
}
