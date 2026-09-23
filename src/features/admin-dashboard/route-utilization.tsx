import type { RouteUtilizationRow } from "./dashboard-types";
import { DashboardEmpty, DashboardPanel } from "./dashboard-panel";

export function RouteUtilization({ routes }: { routes: RouteUtilizationRow[] }) {
  return (
    <DashboardPanel
      title="Route utilization"
      description="Active bookings against capacity on today's operating trips."
    >
      {routes.length === 0 ? (
        <DashboardEmpty
          title="No route activity"
          description="Utilization appears when today's trips are operating."
        />
      ) : (
        <div className="min-w-0 max-w-full overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <caption className="sr-only">Route utilization for today</caption>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th scope="col" className="px-2 py-2 font-medium">Route</th>
                <th scope="col" className="px-2 py-2 font-medium">Bookings</th>
                <th scope="col" className="px-2 py-2 font-medium">Capacity</th>
                <th scope="col" className="px-2 py-2 font-medium">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.routeId} className="border-b border-border last:border-0">
                  <td className="px-2 py-3">
                    <span className="font-medium">{route.code}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{route.name}</span>
                  </td>
                  <td className="px-2 py-3">{route.bookings}</td>
                  <td className="px-2 py-3">{route.capacity}</td>
                  <td className="px-2 py-3">{route.utilizationLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  );
}
