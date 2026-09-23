import { DashboardEmpty, DashboardPanel } from "@/features/admin-dashboard/dashboard-panel";

import type { VehicleUsageRow } from "./analytics-metrics";

export function VehicleUtilization({ vehicles }: { vehicles: VehicleUsageRow[] }) {
  return (
    <DashboardPanel
      title="Vehicle assignments"
      description="Trips assigned in this period. Utilization is occupied seats divided by capacity on operating trips."
    >
      {vehicles.length === 0 ? (
        <DashboardEmpty title="No trips available." description="Vehicle assignments appear when trips fall in this period." />
      ) : (
        <div className="min-w-0 max-w-full overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Trips assigned to each vehicle</caption>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th scope="col" className="px-2 py-2 font-medium">Vehicle</th>
                <th scope="col" className="px-2 py-2 font-medium">Trips</th>
                <th scope="col" className="px-2 py-2 font-medium">Occupied</th>
                <th scope="col" className="px-2 py-2 font-medium">Capacity</th>
                <th scope="col" className="px-2 py-2 font-medium">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-3">
                    <span className="font-medium">{vehicle.registrationNumber}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{vehicle.displayName}</span>
                  </td>
                  <td className="px-2 py-3">{vehicle.trips}</td>
                  <td className="px-2 py-3">{vehicle.occupied}</td>
                  <td className="px-2 py-3">{vehicle.capacity}</td>
                  <td className="px-2 py-3">{vehicle.utilizationLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  );
}
