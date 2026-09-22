"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { homePathFor } from "@/features/auth/demo-users";
import { useCurrentUser } from "@/features/auth/current-user-provider";
import type { UserRole } from "@/types/user";

type RoleGuardProps = {
  role: UserRole;
  children: ReactNode;
};

export function RoleGuard({ role, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isReady } = useCurrentUser();
  const allowed = isReady && user?.role === role;

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== role) {
      router.replace(homePathFor(user));
    }
  }, [isReady, user, role, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Loading CampusRide…</p>
      </div>
    );
  }

  return children;
}
