"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DashboardEmpty } from "@/features/admin-dashboard/dashboard-panel";

import { AnalyticsFiltersBar } from "./analytics-filters";
import { buildAnalytics, initialFilters } from "./analytics-metrics";
import { CancellationSummary } from "./cancellation-summary";
import { DemandByDateChart } from "./demand-by-date-chart";
import { DemandByHourChart } from "./demand-by-hour-chart";
import { DriverUtilization } from "./driver-utilization";
import { RouteUtilizationChart } from "./route-utilization-chart";
import { TripOccupancyTable } from "./trip-occupancy-table";
import { TripStatusChart } from "./trip-status-chart";
import type { AnalyticsFilters } from "./analytics-types";
import { useAdminAnalytics } from "./use-admin-analytics";
import { VehicleUtilization } from "./vehicle-utilization";

export function AdminAnalytics() {
  const data = useAdminAnalytics();
  const [filters, setFilters] = useState<AnalyticsFilters | null>(null);
  const activeFilters = useMemo(() => {
    if (data.status !== "ready") {
      return null;
    }
    return filters ?? initialFilters(data.records.trips);
  }, [data, filters]);
  const model = useMemo(() => {
    if (data.status !== "ready" || !activeFilters) {
      return null;
    }
    return buildAnalytics(data.records, activeFilters);
  }, [data, activeFilters]);

  if (data.status === "error") {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          title="Transport Analytics"
          description="Understand shuttle demand, route utilization, occupancy, and operational performance."
        />
        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-card" role="alert">
          <p className="text-sm font-medium">Unable to load analytics.</p>
          <Button className="mt-4" type="button" onClick={data.retry}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (data.status !== "ready" || !activeFilters || !model) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          title="Transport Analytics"
          description="Understand shuttle demand, route utilization, occupancy, and operational performance."
        />
        <p className="mt-8 text-sm text-muted-foreground" role="status">
          Loading analytics…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Transport Analytics"
        description="Understand shuttle demand, route utilization, occupancy, and operational performance."
      />
      <section className="mt-6 rounded-lg border border-border bg-card p-4 shadow-card">
        <AnalyticsFiltersBar
          filters={activeFilters}
          bounds={data.bounds}
          routes={data.records.routes}
          onChange={setFilters}
        />
      </section>
      {model.invalidRange ? (
        <div className="mt-4">
          <DashboardEmpty title="No data for this period." description="Choose an end date on or after the start date." />
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Total Trips" value={String(model.tripCount)} hint={`${model.operatingTrips} operating, ${model.statuses.find((item) => item.status === "cancelled")?.count ?? 0} cancelled`} />
            <Kpi label="Total Bookings" value={String(model.demandBookings)} hint="Excludes cancelled bookings" />
            <Kpi label="Average Occupancy" value={model.occupancyLabel} hint="Occupied seats / operating capacity" />
            <Kpi label="Cancellation Rate" value={model.cancellationLabel} hint={`${model.cancelledBookings} of ${model.totalBookings} bookings`} />
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <DemandByHourChart demand={model.hourly} peakLabel={model.peakLabel} />
            <DemandByDateChart points={model.byDate} />
            <TripStatusChart statuses={model.statuses} />
            <RouteUtilizationChart routes={model.routes} />
          </div>
          <div className="mt-4 grid gap-4">
            <TripOccupancyTable rows={model.occupancy} />
            <CancellationSummary
              cancelled={model.cancelledBookings}
              total={model.totalBookings}
              rateLabel={model.cancellationLabel}
              routes={model.cancellations}
            />
            <div className="grid gap-4 xl:grid-cols-2">
              <DriverUtilization drivers={model.drivers} />
              <VehicleUtilization vehicles={model.vehicles} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-card">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </article>
  );
}
