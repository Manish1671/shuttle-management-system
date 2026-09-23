import type { ReactNode } from "react";

type DashboardPanelProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function DashboardPanel({ title, description, action, children }: DashboardPanelProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function DashboardEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-dashed border-border px-4 py-6">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
