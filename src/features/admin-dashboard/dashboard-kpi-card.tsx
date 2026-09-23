"use client";

import type { LucideIcon } from "lucide-react";

type DashboardKpiCardProps = {
  label: string;
  value: number;
  context: string;
  icon: LucideIcon;
};

export function DashboardKpiCard({ label, value, context, icon: Icon }: DashboardKpiCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 text-primary" aria-hidden="true" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{context}</p>
    </article>
  );
}
