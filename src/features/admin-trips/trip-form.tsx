"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useWriteGuard } from "@/lib/use-write-guard";
import { plannedArrival, tripService } from "@/services/trip-service";
import type { Trip } from "@/types/trip";

import {
  driverAssignmentOptions,
  vehicleAssignmentOptions,
  type TripManagementData,
} from "./trip-data";
import type { AssignmentOption } from "./trip-types";

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function TripForm({
  draft,
  data,
  onSaved,
}: {
  draft: Trip | null;
  data: TripManagementData;
  onSaved: () => void;
}) {
  const activeRoutes = data.routes.filter((route) => route.active || route.id === draft?.routeId);
  const [serviceDate, setServiceDate] = useState(draft?.serviceDate ?? "");
  const [departureTime, setDepartureTime] = useState(draft?.departureTime ?? "08:00");
  const [routeId, setRouteId] = useState(draft?.routeId ?? activeRoutes[0]?.id ?? "");
  const [driverId, setDriverId] = useState(draft?.driverId ?? "");
  const [vehicleId, setVehicleId] = useState(draft?.vehicleId ?? "");
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useWriteGuard();
  const route = data.routes.find((item) => item.id === routeId) ?? null;
  const stops = route
    ? route.stopIds.flatMap((stopId) => {
        const stop = data.stops.find((item) => item.id === stopId);
        return stop ? [stop] : [];
      })
    : [];
  const arrival = route ? plannedArrival(route, departureTime, draft) : null;
  const plan = useMemo(
    () => ({
      serviceDate,
      departureTime,
      routeId,
      existingId: draft?.id,
    }),
    [serviceDate, departureTime, routeId, draft?.id],
  );
  const drivers = useMemo(() => driverAssignmentOptions(data, plan), [data, plan]);
  const vehicles = useMemo(() => vehicleAssignmentOptions(data, plan), [data, plan]);
  const availableDrivers = drivers.filter((option) => option.selectable).length;
  const availableVehicles = vehicles.filter((option) => option.selectable).length;

  function save() {
    run(() => {
    setError(null);
    const result = tripService.saveTrip({
      id: draft?.id,
      routeId,
      driverId,
      vehicleId,
      serviceDate,
      departureTime,
    });
    if (!result.ok) {
      setError(result.errors[0]?.message ?? "Unable to save this trip.");
      return;
    }
    onSaved();
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1.5 block font-medium">Date <span className="text-destructive" aria-hidden="true">*</span><span className="sr-only"> required</span></span>
          <input
            className={fieldClassName}
            type="date"
            value={serviceDate}
            required
            onChange={(event) => setServiceDate(event.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-medium">Departure <span className="text-destructive" aria-hidden="true">*</span><span className="sr-only"> required</span></span>
          <input
            className={fieldClassName}
            type="time"
            value={departureTime}
            required
            onChange={(event) => setDepartureTime(event.target.value)}
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Route <span className="text-destructive" aria-hidden="true">*</span><span className="sr-only"> required</span></span>
        <select className={fieldClassName} value={routeId} onChange={(event) => setRouteId(event.target.value)}>
          {activeRoutes.length === 0 ? <option value="">No active routes</option> : null}
          {activeRoutes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.code} · {item.name}
              {item.active ? "" : " (inactive)"}
            </option>
          ))}
        </select>
      </label>
      {route ? (
        <div className="rounded-md border border-border px-3 py-2 text-sm">
          <p>
            {route.estimatedDurationMinutes} min
            {arrival ? ` · arrives ${arrival}` : " · arrival does not fit in this day"}
          </p>
          {stops.length === 0 ? (
            <p className="mt-2 text-muted-foreground">This route has no stops configured.</p>
          ) : (
            <ol className="mt-2 grid gap-1">
              {stops.map((stop, index) => (
                <li key={stop.id}>
                  {index + 1}. {stop.name}
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : null}
      <AssignmentList
        legend="Driver"
        name="driver"
        empty="No drivers are available for this time."
        options={drivers}
        selectedId={driverId}
        availableCount={availableDrivers}
        onSelect={setDriverId}
      />
      <AssignmentList
        legend="Vehicle"
        name="vehicle"
        empty="No vehicles are available for this time."
        options={vehicles}
        selectedId={vehicleId}
        availableCount={availableVehicles}
        onSelect={setVehicleId}
      />
      <p className="text-sm text-muted-foreground">
        Capacity follows the vehicle. Booked seats stay tied to existing bookings.
      </p>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {draft ? "Save trip" : "Create trip"}
      </Button>
    </form>
  );
}

function AssignmentList({
  legend,
  name,
  empty,
  options,
  selectedId,
  availableCount,
  onSelect,
}: {
  legend: string;
  name: string;
  empty: string;
  options: readonly AssignmentOption[];
  selectedId: string;
  availableCount: number;
  onSelect: (id: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{legend}</legend>
      {availableCount === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : null}
      <div className="grid gap-2">
        {options.map((option) => (
          <label
            key={option.id}
            className={`flex gap-3 rounded-md border px-3 py-2 text-sm ${
              selectedId === option.id ? "border-primary" : "border-border"
            } ${option.selectable ? "" : "opacity-70"}`}
          >
            <input
              className="mt-1"
              type="radio"
              name={name}
              value={option.id}
              checked={selectedId === option.id}
              disabled={!option.selectable}
              onChange={() => onSelect(option.id)}
            />
            <span>
              <span className="block font-medium">{option.title}</span>
              <span className="block text-muted-foreground">
                {option.state} · {option.duty}
              </span>
              <span className="block text-muted-foreground">{option.detail}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
