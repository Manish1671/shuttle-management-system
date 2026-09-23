"use client";

import { Armchair, Bus, Ticket, UserCheck, Waypoints } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/time";

import { DashboardKpiCard } from "./dashboard-kpi-card";
import { DemandChart } from "./demand-chart";
import { DriverStatusSummary } from "./driver-status-summary";
import { OperationalAlerts } from "./operational-alerts";
import { RecentBookings } from "./recent-bookings";
import { RouteUtilization } from "./route-utilization";
import { TodayTrips } from "./today-trips";
import { useAdminDashboard } from "./use-admin-dashboard";

const icons = {
  trips: Bus,
  bookings: Ticket,
  active: Waypoints,
  drivers: UserCheck,
  seats: Armchair,
} as const;

export function AdminDashboard() {
  const dashboard = useAdminDashboard();

  if (dashboard.status === "loading" || !dashboard.data) {
    if (dashboard.status === "error") {
      return (
        <div className="mx-auto w-full max-w-6xl">
          <PageHeader
            title="Admin Overview"
            description="Transport operations at a glance."
          />
          <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-card" role="alert">
            <p className="text-sm font-medium">Unable to load dashboard data.</p>
            <p className="mt-1 text-sm text-muted-foreground">Please try again.</p>
            <Button className="mt-4" type="button" onClick={dashboard.retry}>
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="Admin Overview" description="Transport operations at a glance." />
        <p className="mt-8 text-sm text-muted-foreground" role="status">
          Loading dashboard data…
        </p>
      </div>
    );
  }

  const data = dashboard.data;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Admin Overview" description="Transport operations at a glance." />
      <p className="mt-3 text-sm text-muted-foreground">
        Service date <time dateTime={data.serviceDate}>{formatDisplayDate(data.serviceDate)}</time>
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {data.kpis.map((kpi) => (
          <DashboardKpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            context={kpi.context}
            icon={icons[kpi.id as keyof typeof icons]}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <TodayTrips trips={data.trips} />
        </div>
        <div className="grid gap-4 xl:col-span-2">
          <DemandChart demand={data.demand} peaks={data.peaks} />
          <DriverStatusSummary counts={data.driverStatus} />
        </div>
      </div>

      <div className="mt-4">
        <RouteUtilization routes={data.routes} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <RecentBookings bookings={data.recentBookings} />
        </div>
        <div className="xl:col-span-2">
          <OperationalAlerts alerts={data.alerts} />
        </div>
      </div>
    </div>
  );
}
