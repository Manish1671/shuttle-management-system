import { DashboardEmpty, DashboardPanel } from "@/features/admin-dashboard/dashboard-panel";

import type { CancellationRouteRow } from "./analytics-metrics";

export function CancellationSummary({
  cancelled,
  total,
  rateLabel,
  routes,
}: {
  cancelled: number;
  total: number;
  rateLabel: string;
  routes: CancellationRouteRow[];
}) {
  return (
    <DashboardPanel
      title="Cancellations"
      description="Cancelled bookings divided by every booking on trips in this period. Bookings do not store a cancellation reason."
    >
      {total === 0 ? (
        <DashboardEmpty title="No data for this period." description="Cancellation rate appears when the period has bookings." />
      ) : (
        <div className="grid gap-4">
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Cancelled bookings</dt>
              <dd className="mt-1 text-xl font-semibold">{cancelled}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total bookings</dt>
              <dd className="mt-1 text-xl font-semibold">{total}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Cancellation rate</dt>
              <dd className="mt-1 text-xl font-semibold">{rateLabel}</dd>
            </div>
          </dl>
          {routes.length === 0 ? null : (
            <div className="min-w-0 max-w-full overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <caption className="sr-only">Cancellations by route</caption>
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th scope="col" className="px-2 py-2 font-medium">Route</th>
                    <th scope="col" className="px-2 py-2 font-medium">Cancelled</th>
                    <th scope="col" className="px-2 py-2 font-medium">Bookings</th>
                    <th scope="col" className="px-2 py-2 font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route) => (
                    <tr key={route.routeId} className="border-b border-border last:border-0">
                      <td className="px-2 py-3">
                        <span className="font-medium">{route.name}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{route.code}</span>
                      </td>
                      <td className="px-2 py-3">{route.cancelled}</td>
                      <td className="px-2 py-3">{route.total}</td>
                      <td className="px-2 py-3">{route.rateLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardPanel>
  );
}
