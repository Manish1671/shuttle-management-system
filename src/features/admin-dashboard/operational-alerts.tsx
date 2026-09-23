import type { DashboardAlert } from "./dashboard-types";
import { DashboardPanel } from "./dashboard-panel";

export function OperationalAlerts({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <DashboardPanel title="Attention" description="Items derived from today's trips, drivers, and vehicles.">
      {alerts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-6">
          <p className="text-sm font-medium">All systems operational</p>
          <p className="mt-1 text-sm text-muted-foreground">No immediate attention items.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="rounded-md border border-border px-3 py-3">
              <p className="text-sm font-medium">{alert.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{alert.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
