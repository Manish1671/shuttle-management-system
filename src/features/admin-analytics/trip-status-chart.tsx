"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardPanel } from "@/features/admin-dashboard/dashboard-panel";

import type { StatusCount } from "./analytics-metrics";

export function TripStatusChart({ statuses }: { statuses: StatusCount[] }) {
  return (
    <DashboardPanel title="Trip status" description="Every trip in the selected period, including cancelled trips.">
      <figure>
        <figcaption className="sr-only">Trip counts by status</figcaption>
        <table className="sr-only">
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
        <div className="h-56 w-full" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statuses} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} interval={0} label={{ value: "Status", position: "insideBottom", offset: -2, fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis allowDecimals={false} width={32} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} label={{ value: "Trips", angle: -90, position: "insideLeft", fill: "var(--muted-foreground)", fontSize: 12 }} />
              <Tooltip cursor={{ fill: "var(--secondary)" }} formatter={(value) => [`${value ?? 0} trips`, "Trips"]} />
              <Bar dataKey="count" fill="var(--chart-3)" radius={[4, 4, 0, 0]} name="Trips" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </DashboardPanel>
  );
}
