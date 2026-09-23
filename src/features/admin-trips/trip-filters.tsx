import type { Driver } from "@/types/driver";
import type { Route } from "@/types/route";
import type { TripStatus } from "@/types/trip";
import type { Vehicle } from "@/types/vehicle";

import type { TripFilters } from "./trip-types";

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const statuses: { value: "all" | TripStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "boarding", label: "Boarding" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function TripFiltersBar({
  filters,
  routes,
  drivers,
  vehicles,
  onChange,
}: {
  filters: TripFilters;
  routes: readonly Route[];
  drivers: readonly Driver[];
  vehicles: readonly Vehicle[];
  onChange: (filters: TripFilters) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <label className="text-sm md:col-span-2 xl:col-span-3">
        <span className="mb-1.5 block font-medium">Search</span>
        <input
          className={fieldClassName}
          value={filters.query}
          placeholder="Trip, route, driver, or vehicle"
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </label>
      <Select
        label="Date"
        value={filters.date}
        onChange={(date) => onChange({ ...filters, date: date as TripFilters["date"] })}
        options={[
          ["today", "Today"],
          ["upcoming", "Upcoming"],
          ["past", "Past"],
          ["all", "All"],
        ]}
      />
      <Select
        label="Status"
        value={filters.status}
        onChange={(status) => onChange({ ...filters, status: status as TripFilters["status"] })}
        options={statuses.map((status) => [status.value, status.label])}
      />
      <Select
        label="Route"
        value={filters.routeId}
        onChange={(routeId) => onChange({ ...filters, routeId })}
        options={[["all", "All routes"], ...routes.map((route) => [route.id, `${route.code} · ${route.name}`] as [string, string])]}
      />
      <Select
        label="Driver"
        value={filters.driverId}
        onChange={(driverId) => onChange({ ...filters, driverId })}
        options={[["all", "All drivers"], ...drivers.map((driver) => [driver.id, driver.name] as [string, string])]}
      />
      <Select
        label="Vehicle"
        value={filters.vehicleId}
        onChange={(vehicleId) => onChange({ ...filters, vehicleId })}
        options={[
          ["all", "All vehicles"],
          ...vehicles.map((vehicle) => [vehicle.id, vehicle.registrationNumber] as [string, string]),
        ]}
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <select className={fieldClassName} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
