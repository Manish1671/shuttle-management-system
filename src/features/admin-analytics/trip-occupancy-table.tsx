import { DashboardEmpty, DashboardPanel } from "@/features/admin-dashboard/dashboard-panel";
import { formatDisplayDate } from "@/lib/time";

import type { OccupancyRow } from "./analytics-metrics";

const bandLabel = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  unknown: "—",
} as const;

export function TripOccupancyTable({ rows }: { rows: OccupancyRow[] }) {
  return (
    <DashboardPanel
      title="Trip occupancy"
      description="Non-cancelled bookings divided by capacity on each operating trip. High means 80% or more. Moderate means 40% up to 80%. Those splits are display labels."
    >
      {rows.length === 0 ? (
        <DashboardEmpty title="No trips available." description="Occupancy appears when the period includes operating trips." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <caption className="sr-only">Trip occupancy</caption>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th scope="col" className="px-2 py-2 font-medium">Trip</th>
                <th scope="col" className="px-2 py-2 font-medium">Route</th>
                <th scope="col" className="px-2 py-2 font-medium">Date</th>
                <th scope="col" className="px-2 py-2 font-medium">Departure</th>
                <th scope="col" className="px-2 py-2 font-medium">Booked</th>
                <th scope="col" className="px-2 py-2 font-medium">Capacity</th>
                <th scope="col" className="px-2 py-2 font-medium">Occupancy</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-3">
                    <span className="font-medium">{row.routeName}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{row.id}</span>
                  </td>
                  <td className="px-2 py-3">{row.routeCode}</td>
                  <td className="px-2 py-3">{formatDisplayDate(row.serviceDate)}</td>
                  <td className="px-2 py-3">{row.departureTime}</td>
                  <td className="px-2 py-3">{row.booked}</td>
                  <td className="px-2 py-3">{row.capacity}</td>
                  <td className="px-2 py-3">
                    {row.utilizationLabel}
                    <span className="mt-0.5 block text-xs text-muted-foreground">{bandLabel[row.band]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  );
}
