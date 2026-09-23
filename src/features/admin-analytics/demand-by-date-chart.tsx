"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardEmpty, DashboardPanel } from "@/features/admin-dashboard/dashboard-panel";

import type { AnalyticsDatePoint } from "./analytics-metrics";

export function DemandByDateChart({ points }: { points: AnalyticsDatePoint[] }) {
  const hasBookings = points.some((point) => point.bookings > 0);

  return (
    <DashboardPanel
      title="Demand by date"
      description="Non-cancelled bookings on operating trips, by service date."
    >
      {points.length === 0 || !hasBookings ? (
        <DashboardEmpty title="No data for this period." description="Daily demand appears when the selected dates have bookings." />
      ) : (
        <figure>
          <figcaption className="sr-only">Booking counts by service date</figcaption>
          <table className="sr-only">
            <caption>Bookings by date</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.date}>
                  <td>{point.label}</td>
                  <td>{point.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="h-56 w-full" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} interval="preserveStartEnd" label={{ value: "Service date", position: "insideBottom", offset: -2, fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis allowDecimals={false} width={32} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} label={{ value: "Bookings", angle: -90, position: "insideLeft", fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "var(--secondary)" }} formatter={(value) => [`${value ?? 0} bookings`, "Demand"]} />
                <Bar dataKey="bookings" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </figure>
      )}
    </DashboardPanel>
  );
}
