"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { formatDisplayDate, todayDateString } from "@/lib/time";

import { driverMetrics, filterDrivers } from "./driver-data";
import { DriverDetailsSheet } from "./driver-details-sheet";
import { DriverTable } from "./driver-table";
import { DriverTimelineOverview } from "./driver-timeline-overview";
import { defaultDriverFilters, type DriverFilters } from "./driver-types";
import { useAdminDrivers } from "./use-admin-drivers";

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AdminDrivers() {
  const [date, setDate] = useState(todayDateString);
  const [filters, setFilters] = useState<DriverFilters>(defaultDriverFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const data = useAdminDrivers(date);
  const metrics = useMemo(() => driverMetrics(data.views), [data.views]);
  const visible = useMemo(() => filterDrivers(data.views, filters), [data.views, filters]);
  const selected = data.views.find((view) => view.driver.id === selectedId) ?? null;

  if (data.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="Driver Management" description="Manage drivers, duty schedules, breaks, and availability." />
        <p className="mt-8 text-sm text-muted-foreground" role="status">
          Loading drivers…
        </p>
      </div>
    );
  }

  if (data.status === "error") {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="Driver Management" description="Manage drivers, duty schedules, breaks, and availability." />
        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-card" role="alert">
          <p className="text-sm font-medium">Unable to load drivers.</p>
          <p className="mt-1 text-sm text-muted-foreground">Please try again.</p>
          <Button className="mt-4" type="button" onClick={data.retry}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Driver Management" description="Manage drivers, duty schedules, breaks, and availability." />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Service date <time dateTime={date}>{formatDisplayDate(date)}</time>
        </p>
        <label className="text-sm">
          <span className="mb-1.5 block font-medium">Date</span>
          <input
            className={fieldClassName}
            type="date"
            value={date}
            onChange={(event) => {
              if (event.target.value) {
                setDate(event.target.value);
              }
            }}
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total drivers" value={metrics.total} hint="Roster size" />
        <Metric label="Available" value={metrics.available} hint="On duty and free at this time" />
        <Metric label="On trip" value={metrics.onTrip} hint="Boarding or in progress" />
        <Metric label="Off duty" value={metrics.offDuty} hint={`${metrics.onBreak} on break`} />
      </div>

      {visible.length > 0 ? (
        <div className="mt-6">
          <DriverTimelineOverview views={visible} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-border bg-card p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block font-medium">Search</span>
            <input
              className={fieldClassName}
              value={filters.query}
              placeholder="Driver name or employee ID"
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium">Status</span>
            <select
              className={fieldClassName}
              value={filters.status}
              onChange={(event) =>
                setFilters({ ...filters, status: event.target.value as DriverFilters["status"] })
              }
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="on_trip">On trip</option>
              <option value="on_break">On break</option>
              <option value="off_duty">Off duty</option>
            </select>
          </label>
        </div>
        <div className="mt-4">
          {visible.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-4 py-8">
              <p className="text-sm font-medium">No drivers found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.views.length === 0
                  ? "No drivers are stored for this campus."
                  : "No drivers match your current filters."}
              </p>
            </div>
          ) : (
            <DriverTable views={visible} onView={setSelectedId} />
          )}
        </div>
      </div>

      <DriverDetailsSheet
        view={selected}
        date={date}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
          }
        }}
      />
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-card">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </article>
  );
}
