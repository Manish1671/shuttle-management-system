"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardPanel } from "@/features/admin-dashboard/dashboard-panel";

import type { StatusCount } from "./analytics-metrics";

export function TripStatusChart({ statuses }: { statuses: StatusCount[] }) {
  return (
    <DashboardPanel title="Trip status" description="Every trip in the selected period, including cancelled trips.">
      <figure>
        <figcaption className="sr-only">Trip counts by status</figcaption>
        <div className="sr-only">
        <table>
          <caption>Trips by status</caption>
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">Trips</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((item) => (
              <tr key={item.status}>
                <td>{item.label}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="h-56 w-full" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statuses} margin={{ top: 8, right: 8, left: 0, bottom: 28 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={48} />
              <YAxis allowDecimals={false} width={36} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <Tooltip cursor={{ fill: "var(--secondary)" }} formatter={(value) => [`${value ?? 0} trips`, "Trips"]} />
              <Bar dataKey="count" fill="var(--chart-3)" radius={[4, 4, 0, 0]} name="Trips" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">Status across, trip count up.</p>
      </figure>
    </DashboardPanel>
  );
}
