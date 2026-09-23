"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { DemandPoint, PeakDemand } from "./dashboard-types";
import { DashboardEmpty, DashboardPanel } from "./dashboard-panel";

export function DemandChart({
  demand,
  peaks,
}: {
  demand: DemandPoint[];
  peaks: PeakDemand[];
}) {
  const hasBookings = demand.some((point) => point.bookings > 0);

  return (
    <DashboardPanel
      title="Shuttle demand"
      description="Bookings grouped by the departure hour of today's trips."
    >
      {!hasBookings ? (
        <DashboardEmpty
          title="No demand data"
          description="Hourly demand appears when today's trips have active bookings."
        />
      ) : (
        <div className="grid gap-4">
          <figure>
            <figcaption id="hourly-demand-caption" className="sr-only">
              Booking counts by departure hour
            </figcaption>
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
                <BarChart data={demand} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis
                    allowDecimals={false}
                    width={32}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--secondary)" }}
                    formatter={(value) => [`${value ?? 0} bookings`, "Demand"]}
                  />
                  <Bar dataKey="bookings" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </figure>
          <div>
            <h4 className="text-sm font-semibold">Peak demand</h4>
            {peaks.length > 1 ? (
              <p className="mt-1 text-sm text-muted-foreground">These hours are tied for the highest count.</p>
            ) : null}
            <ul className="mt-2 space-y-1">
              {peaks.map((peak) => (
                <li key={peak.hour} className="text-sm">
                  <span className="font-medium">{peak.hour}</span>
                  <span className="text-muted-foreground"> · {peak.bookings} bookings</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </DashboardPanel>
  );
}
