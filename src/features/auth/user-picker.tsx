"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, GraduationCap, Loader2, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DemoUser } from "@/types/user";

import { useCurrentUser } from "./current-user-provider";
import { DEMO_USERS, homePathFor, roleLabel } from "./demo-users";

const roleIcons = {
  student: GraduationCap,
  staff: Briefcase,
  admin: Shield,
} as const;

function iconFor(user: DemoUser) {
  if (user.role === "admin") {
    return roleIcons.admin;
  }

  return user.riderType === "staff" ? roleIcons.staff : roleIcons.student;
}

export function UserPicker() {
  const router = useRouter();
  const { selectUser } = useCurrentUser();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function continueAs(user: DemoUser) {
    setPendingId(user.id);
    selectUser(user);
    router.push(homePathFor(user));
  }

  return (
    <ul className="mt-6 space-y-3">
      {DEMO_USERS.map((user) => {
        const Icon = iconFor(user);
        const isPending = pendingId === user.id;

        return (
          <li key={user.id}>
            <article className="rounded-lg border border-border bg-muted/60 p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {user.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{roleLabel(user)}</p>
                  <p className="mt-1 font-mono text-xs text-neutral">{user.id}</p>
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                disabled={pendingId !== null}
                onClick={() => continueAs(user)}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {isPending ? "Opening workspace" : "Continue"}
              </Button>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
