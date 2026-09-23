import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/features/bookings/booking-status-badge";

import { formatBookingDate } from "./admin-bookings-data";
import type { AdminBookingRow } from "./admin-bookings-types";

export function BookingMobileList({
  rows,
  onView,
}: {
  rows: AdminBookingRow[];
  onView: (row: AdminBookingRow) => void;
}) {
  return (
    <ul className="grid gap-3 md:hidden">
      {rows.map((row) => {
        const { view } = row;
        return (
          <li key={view.booking.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{view.booking.id}</h3>
                <p className="mt-1 text-sm">{view.passengerName}</p>
                <p className="text-xs text-muted-foreground">{row.riderId}</p>
              </div>
              <BookingStatusBadge status={view.booking.status} />
            </div>
            <p className="mt-3 text-sm font-medium">
              {view.route?.code ?? "Route"} · {view.route?.name ?? "Unavailable"}
            </p>
            <p className="mt-1 text-sm">
              {view.pickupStop?.name ?? "Pickup"}
              <span className="text-muted-foreground"> → </span>
              {view.dropoffStop?.name ?? "Destination"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {view.trip ? formatBookingDate(view.trip.serviceDate) : "Date unavailable"}
              <span> · {view.trip?.departureTime ?? "--:--"}</span>
              <span> · Seat {view.booking.seatNumber ?? "—"}</span>
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => onView(row)}>
              View
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
