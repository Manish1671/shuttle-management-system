"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardEmpty, DashboardPanel } from "@/features/admin-dashboard/dashboard-panel";
import type { HourlyDemandPoint } from "@/services/operations-metrics";

export function DemandByHourChart({
  demand,
  peakLabel,
}: {
  demand: HourlyDemandPoint[];
  peakLabel: string;
}) {
  const hasBookings = demand.some((point) => point.bookings > 0);

  return (
    <DashboardPanel
      title="Hourly demand"
      description="Non-cancelled bookings grouped by the departure hour of operating trips."
    >
      {!hasBookings ? (
        <DashboardEmpty title="No data for this period." description="Hourly demand appears when operating trips have bookings." />
      ) : (
        <div className="grid gap-4">
          <figure>
            <figcaption className="sr-only">Booking counts by departure hour</figcaption>
            <div className="sr-only">
            <table>
              <caption>Bookings by hour</caption>
              <thead>
                <tr>
                  <th scope="col">Hour</th>
                  <th scope="col">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {demand.map((point) => (
                  <tr key={point.hour}>
                    <td>{point.hour}</td>
                    <td>{point.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="h-56 w-full" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demand} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} width={36} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip cursor={{ fill: "var(--secondary)" }} formatter={(value) => [`${value ?? 0} bookings`, "Demand"]} />
                  <Bar dataKey="bookings" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Departure hour across, bookings up.</p>
          </figure>
          <p className="text-sm">
            <span className="font-medium">Peak demand: {peakLabel}</span>
          </p>
        </div>
      )}
    </DashboardPanel>
  );
}
