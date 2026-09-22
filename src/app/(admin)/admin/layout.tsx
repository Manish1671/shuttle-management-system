import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/admin-shell";
import { RoleGuard } from "@/components/layout/role-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="admin">
      <AdminShell>{children}</AdminShell>
    </RoleGuard>
  );
}
