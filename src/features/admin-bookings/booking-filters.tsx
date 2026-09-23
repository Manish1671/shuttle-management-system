import type { AdminBookingFilters, AdminRouteOption } from "./admin-bookings-types";

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

type BookingFiltersProps = {
  filters: AdminBookingFilters;
  routes: AdminRouteOption[];
  onChange: (filters: AdminBookingFilters) => void;
};

export function BookingFilters({ filters, routes, onChange }: BookingFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Search</span>
        <input
          className={fieldClassName}
          value={filters.query}
          placeholder="Booking, rider, route, or trip"
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Status</span>
        <select
          className={fieldClassName}
          value={filters.status}
          onChange={(event) =>
            onChange({ ...filters, status: event.target.value as AdminBookingFilters["status"] })
          }
        >
          <option value="all">All</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Date</span>
        <select
          className={fieldClassName}
          value={filters.date}
          onChange={(event) =>
            onChange({ ...filters, date: event.target.value as AdminBookingFilters["date"] })
          }
        >
          <option value="all">All dates</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Route</span>
        <select
          className={fieldClassName}
          value={filters.routeId}
          onChange={(event) => onChange({ ...filters, routeId: event.target.value })}
        >
          <option value="all">All routes</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
