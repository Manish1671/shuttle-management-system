"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { tripMetrics, visibleTrips } from "./trip-data";
import { TripDetailsSheet } from "./trip-details-sheet";
import { TripFiltersBar } from "./trip-filters";
import { TripForm } from "./trip-form";
import { TripTable } from "./trip-table";
import { defaultTripFilters, type TripFilters } from "./trip-types";
import { useAdminTrips } from "./use-admin-trips";

export function AdminTrips() {
  const data = useAdminTrips();
  const [filters, setFilters] = useState<TripFilters>(defaultTripFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const ready = data.status === "ready" ? data : null;
  const metrics = useMemo(() => (ready ? tripMetrics(ready.trips) : null), [ready]);
  const visible = useMemo(() => (ready ? visibleTrips(ready.trips, filters) : []), [ready, filters]);
  const selected = ready?.trips.find((view) => view.trip.id === selectedId) ?? null;
  const editing = ready?.trips.find((view) => view.trip.id === editingId)?.trip ?? null;

  if (data.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          title="Trip Management"
          description="Schedule shuttle trips, assign drivers and vehicles, and monitor trip capacity."
        />
        <p className="mt-8 text-sm text-muted-foreground" role="status">
          Loading trips…
        </p>
      </div>
    );
  }

  if (data.status === "error" || !metrics) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          title="Trip Management"
          description="Schedule shuttle trips, assign drivers and vehicles, and monitor trip capacity."
        />
        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-card" role="alert">
          <p className="text-sm font-medium">Unable to load trips.</p>
          <p className="mt-1 text-sm text-muted-foreground">Please try again.</p>
          <Button className="mt-4" type="button" onClick={data.retry}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Trip Management"
          description="Schedule shuttle trips, assign drivers and vehicles, and monitor trip capacity."
        />
        <Button type="button" onClick={() => setCreating(true)}>
          Add trip
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Today's Trips" value={metrics.today} hint="All statuses" />
        <Metric label="Scheduled" value={metrics.scheduled} hint="Not yet running" />
        <Metric label="Active" value={metrics.active} hint="Boarding or in progress" />
        <Metric label="Completed" value={metrics.completed} hint="Finished today" />
        <Metric label="Cancelled" value={metrics.cancelled} hint="Kept for history" />
      </div>

      <section className="mt-6 rounded-lg border border-border bg-card p-4 shadow-card">
        <TripFiltersBar
          filters={filters}
          routes={ready.routes}
          drivers={ready.drivers}
          vehicles={ready.vehicles}
          onChange={setFilters}
        />
        <div className="mt-4">
          {visible.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-4 py-8">
              <p className="text-sm font-medium">
                {ready.trips.length === 0 || (filters.date === "today" && filters.query.trim() === "" && filters.status === "all" && filters.routeId === "all" && filters.driverId === "all" && filters.vehicleId === "all")
                  ? "No trips scheduled."
                  : "No trips match your current filters."}
              </p>
            </div>
          ) : (
            <TripTable trips={visible} onView={setSelectedId} />
          )}
        </div>
      </section>

      <TripDetailsSheet
        view={selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
          }
        }}
        onEdit={(tripId) => {
          setSelectedId(null);
          setEditingId(tripId);
        }}
      />

      <Sheet open={creating} onOpenChange={setCreating}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>New trip</SheetTitle>
            <SheetDescription>New trips start as scheduled. Capacity comes from the vehicle.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <TripForm
              key="new"
              draft={null}
              data={ready}
              onSaved={() => setCreating(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={editing !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Edit trip</SheetTitle>
            <SheetDescription>
              Changes are checked against duty, breaks, vehicle overlap, and existing bookings.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {editing ? (
              <TripForm
                key={editing.id}
                draft={editing}
                data={ready}
                onSaved={() => setEditingId(null)}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
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
