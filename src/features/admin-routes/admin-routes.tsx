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
import type { Stop } from "@/types/stop";

import { filterRoutes, routeMetrics } from "./route-data";
import { RouteDetailsSheet } from "./route-details-sheet";
import { RouteForm } from "./route-form";
import { RouteTable } from "./route-table";
import { defaultRouteFilters, type RouteFilters } from "./route-types";
import { StopForm } from "./stop-form";
import { useAdminRoutes } from "./use-admin-routes";

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AdminRoutes() {
  const data = useAdminRoutes();
  const [filters, setFilters] = useState<RouteFilters>(defaultRouteFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creatingRoute, setCreatingRoute] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | "new" | null>(null);
  const metrics = useMemo(() => routeMetrics(data.routes, data.stops), [data.routes, data.stops]);
  const visible = useMemo(() => filterRoutes(data.routes, filters), [data.routes, filters]);
  const selected = data.routes.find((view) => view.route.id === selectedId) ?? null;

  if (data.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="Route Management" description="Manage campus shuttle routes, stops, and service availability." />
        <p className="mt-8 text-sm text-muted-foreground" role="status">
          Loading routes…
        </p>
      </div>
    );
  }

  if (data.status === "error") {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="Route Management" description="Manage campus shuttle routes, stops, and service availability." />
        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-card" role="alert">
          <p className="text-sm font-medium">Unable to load routes.</p>
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Route Management" description="Manage campus shuttle routes, stops, and service availability." />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setEditingStop("new")}>
            Add stop
          </Button>
          <Button type="button" onClick={() => setCreatingRoute(true)}>
            Add route
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total Routes" value={metrics.totalRoutes} hint="Campus network" />
        <Metric label="Active Routes" value={metrics.activeRoutes} hint="Offered for new bookings" />
        <Metric label="Inactive Routes" value={metrics.inactiveRoutes} hint="Kept for history" />
        <Metric label="Total Stops" value={metrics.totalStops} hint="Shared across routes" />
      </div>

      <section className="mt-6 rounded-lg border border-border bg-card p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block font-medium">Search</span>
            <input
              className={fieldClassName}
              value={filters.query}
              placeholder="Route name, code, or stop"
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium">Status</span>
            <select
              className={fieldClassName}
              value={filters.activity}
              onChange={(event) =>
                setFilters({ ...filters, activity: event.target.value as RouteFilters["activity"] })
              }
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
        <div className="mt-4">
          {visible.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-4 py-8">
              <p className="text-sm font-medium">No routes found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.routes.length === 0
                  ? "No routes are stored for this campus."
                  : "No routes match your current filters."}
              </p>
            </div>
          ) : (
            <RouteTable routes={visible} onView={setSelectedId} />
          )}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-border bg-card p-4 shadow-card">
        <h3 className="text-base font-semibold">Stops</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Stops stay in the campus list when they are removed from a route.
        </p>
        {data.stops.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No stops are stored yet.</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {data.stops.map((stop) => (
              <li key={stop.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{stop.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {stop.shortName} · {stop.active ? "Active" : "Inactive"}
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingStop(stop)}>
                  Edit {stop.shortName}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <RouteDetailsSheet
        view={selected}
        stops={data.stops}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
          }
        }}
      />

      <Sheet open={creatingRoute} onOpenChange={setCreatingRoute}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>New route</SheetTitle>
            <SheetDescription>Add a route with at least two stops in service order.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <RouteForm
              draft={{
                name: "",
                code: "",
                description: "",
                stopIds: [],
                estimatedDurationMinutes: 20,
                active: true,
              }}
              stops={data.stops}
              submitLabel="Create route"
              onSaved={() => setCreatingRoute(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={editingStop !== null} onOpenChange={(open) => !open && setEditingStop(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingStop && editingStop !== "new" ? editingStop.name : "New stop"}</SheetTitle>
            <SheetDescription>The stop identifier stays stable after it is created.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {editingStop ? (
              <StopForm
                key={editingStop === "new" ? "new" : editingStop.id}
                draft={
                  editingStop === "new"
                    ? { name: "", shortName: "", description: "", active: true }
                    : editingStop
                }
                onSaved={() => setEditingStop(null)}
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
