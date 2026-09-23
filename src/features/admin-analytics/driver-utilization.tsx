import { DashboardEmpty, DashboardPanel } from "@/features/admin-dashboard/dashboard-panel";

import type { DriverUsageRow } from "./analytics-metrics";

export function DriverUtilization({ drivers }: { drivers: DriverUsageRow[] }) {
  return (
    <DashboardPanel
      title="Driver assignments"
      description="Assigned trips in this period. Minutes are the sum of operating trip durations, not hours on duty."
    >
      {drivers.length === 0 ? (
        <DashboardEmpty title="No trips available." description="Driver assignments appear when trips fall in this period." />
      ) : (
        <div className="min-w-0 max-w-full overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">Trips assigned to each driver</caption>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th scope="col" className="px-2 py-2 font-medium">Driver</th>
                <th scope="col" className="px-2 py-2 font-medium">Trips</th>
                <th scope="col" className="px-2 py-2 font-medium">Operating</th>
                <th scope="col" className="px-2 py-2 font-medium">Completed</th>
                <th scope="col" className="px-2 py-2 font-medium">Assigned minutes</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-3">
                    <span className="font-medium">{driver.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{driver.employeeId}</span>
                  </td>
                  <td className="px-2 py-3">{driver.trips}</td>
                  <td className="px-2 py-3">{driver.operating}</td>
                  <td className="px-2 py-3">{driver.completed}</td>
                  <td className="px-2 py-3">{driver.minutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  );
}
