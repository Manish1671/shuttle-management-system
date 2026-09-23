import { ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/time";
import type { BookingViewModel } from "@/services/booking-view";

import { BookingStatusBadge } from "./booking-status-badge";

type BookingCardProps = {
  view: BookingViewModel;
  onView: (view: BookingViewModel) => void;
  onCancel?: (view: BookingViewModel) => void;
};

export function BookingCard({ view, onView, onCancel }: BookingCardProps) {
  const { booking, trip } = view;

  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold">Booking {booking.id}</h3>
        <BookingStatusBadge status={booking.status} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {trip ? formatDisplayDate(trip.serviceDate) : "Date unavailable"}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight">
        {trip?.departureTime ?? "--:--"}
        <span className="px-1.5 font-normal text-muted-foreground">—</span>
        {trip?.arrivalTime ?? "--:--"}
      </p>
      <div className="mt-3 text-sm">
        <p className="font-medium">{view.pickupStop?.name ?? "Pickup"}</p>
        <ArrowDown className="my-1 size-4 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">{view.dropoffStop?.name ?? "Destination"}</p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {view.route?.code ?? "Route"} · {view.route?.name ?? "Unavailable"}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Driver</dt>
          <dd className="font-medium">{view.driver?.name ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Vehicle</dt>
          <dd className="font-medium">{view.vehicle?.displayName ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Seat</dt>
          <dd className="font-medium">{booking.seatNumber ?? "—"}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" className="h-11 flex-1" onClick={() => onView(view)}>
          View details
        </Button>
        {onCancel && view.canCancel ? (
          <Button type="button" variant="destructive" className="h-11 flex-1" onClick={() => onCancel(view)}>
            Cancel booking
          </Button>
        ) : null}
      </div>
    </article>
  );
}
