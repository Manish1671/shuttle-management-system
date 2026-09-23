import type { DriverStatusCounts } from "./dashboard-types";
import { DashboardPanel } from "./dashboard-panel";

const rows: { key: keyof DriverStatusCounts; label: string; detail: string }[] = [
  { key: "available", label: "Available", detail: "On duty and free" },
  { key: "on_trip", label: "On trip", detail: "Boarding or driving" },
  { key: "on_break", label: "On break", detail: "Inside a scheduled break" },
  { key: "off_duty", label: "Off duty", detail: "No shift, or outside duty hours" },
];

export function DriverStatusSummary({ counts }: { counts: DriverStatusCounts }) {
  const total = rows.reduce((sum, row) => sum + counts[row.key], 0);

  return (
    <DashboardPanel
      title="Driver availability"
      description="Derived from today's duty schedule and active trips."
    >
      <ul className="grid grid-cols-2 gap-3">
        {rows.map((row) => (
          <li key={row.key} className="rounded-md border border-border px-3 py-3">
            <p className="text-sm font-medium">{row.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{counts[row.key]}</p>
            <p className="mt-1 text-xs text-muted-foreground">{row.detail}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">{total} drivers in the roster</p>
    </DashboardPanel>
  );
}
