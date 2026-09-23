import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/features/bookings/booking-status-badge";
import { formatDisplayDate } from "@/lib/time";

import type { TripViewModel } from "./trip-data";

export function TripMobileCard({
  view,
  onView,
}: {
  view: TripViewModel;
  onView: (tripId: string) => void;
}) {
  return (
    <article className="rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{view.route?.name ?? "Unknown route"}</h3>
          <p className="text-xs text-muted-foreground">{view.trip.id}</p>
        </div>
        <BookingStatusBadge status={view.trip.status} kind="trip" />
      </div>
      <p className="mt-2 text-sm">
        {formatDisplayDate(view.trip.serviceDate)} · {view.trip.departureTime}–{view.trip.arrivalTime}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {view.driver?.name ?? "No driver"} · {view.vehicle?.registrationNumber ?? "No vehicle"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {view.occupied} booked / {view.trip.capacity} seats
      </p>
      <Button className="mt-3" type="button" variant="outline" size="sm" onClick={() => onView(view.trip.id)}>
        View {view.trip.id}
      </Button>
    </article>
  );
}
