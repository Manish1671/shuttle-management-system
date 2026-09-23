import { DashboardEmpty, DashboardPanel } from "@/features/admin-dashboard/dashboard-panel";

import type { AnalyticsRouteRow } from "./analytics-metrics";

export function RouteUtilizationChart({ routes }: { routes: AnalyticsRouteRow[] }) {
  return (
    <DashboardPanel
      title="Route utilization"
      description="Occupied seats divided by capacity on operating trips. Ordered by route code."
    >
      {routes.length === 0 ? (
        <DashboardEmpty title="No trips available." description="Route utilization appears when the period includes trips." />
      ) : (
        <div className="grid gap-3">
          <table className="sr-only">
            <caption>Route utilization</caption>
            <thead>
              <tr>
                <th scope="col">Route</th>
                <th scope="col">Trips</th>
                <th scope="col">Bookings</th>
                <th scope="col">Capacity</th>
                <th scope="col">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.routeId}>
                  <td>{route.name}</td>
                  <td>{route.trips}</td>
                  <td>{route.bookings}</td>
                  <td>{route.capacity}</td>
                  <td>{route.utilizationLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="grid gap-3">
            {routes.map((route) => (
              <li key={route.routeId}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    <span className="font-medium">{route.name}</span>
                    <span className="ml-2 text-muted-foreground">{route.code}</span>
                  </span>
                  <span className="font-medium">{route.utilizationLabel}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${route.capacity <= 0 ? 0 : Math.min(100, (route.bookings / route.capacity) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {route.bookings} occupied · {route.capacity} seats · {route.trips} trips
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardPanel>
  );
}
