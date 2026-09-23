import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BookingStatusBadge } from "@/features/bookings/booking-status-badge";
import { formatDisplayDate } from "@/lib/time";

import { formatBookingDate } from "./admin-bookings-data";
import type { AdminBookingRow } from "./admin-bookings-types";

function bookedAtLabel(value: string): string {
  const [date, time] = value.split("T");
  if (!date || !time) {
    return value;
  }

  return `${formatDisplayDate(date)} · ${time}`;
}

export function AdminBookingDetailsSheet({
  row,
  onOpenChange,
  onCancel,
}: {
  row: AdminBookingRow | null;
  onOpenChange: (open: boolean) => void;
  onCancel: (row: AdminBookingRow) => void;
}) {
  const view = row?.view;
  const booking = view?.booking;
  const trip = view?.trip;

  return (
    <Sheet open={row !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {row && view && booking ? (
          <>
            <SheetHeader>
              <SheetTitle>Booking {booking.id}</SheetTitle>
              <SheetDescription>Shuttle reservation across the campus network.</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6 text-sm">
              <section>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Booking</h3>
                <dl className="mt-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <BookingStatusBadge status={booking.status} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Booking ID</dt>
                    <dd className="mt-1 font-medium">{booking.id}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Booked at</dt>
                    <dd className="mt-1 font-medium">{bookedAtLabel(booking.bookedAt)}</dd>
                  </div>
                </dl>
              </section>
              <section>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Rider</h3>
                <dl className="mt-3 space-y-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Name</dt>
                    <dd className="mt-1 font-medium">{view.passengerName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Student or employee ID</dt>
                    <dd className="mt-1 font-medium">{row.riderId}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Rider type</dt>
                    <dd className="mt-1 font-medium">{row.riderTypeLabel}</dd>
                  </div>
                </dl>
              </section>
              <section>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Trip</h3>
                <dl className="mt-3 space-y-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Trip ID</dt>
                    <dd className="mt-1 font-medium">{trip?.id ?? "Unavailable"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Date</dt>
                    <dd className="mt-1 font-medium">
                      {trip ? formatBookingDate(trip.serviceDate) : "Unavailable"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Departure</dt>
                    <dd className="mt-1 font-medium">{trip?.departureTime ?? "--:--"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Route</dt>
                    <dd className="mt-1 font-medium">
                      {view.route ? `${view.route.code} · ${view.route.name}` : "Unavailable"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Driver</dt>
                    <dd className="mt-1 font-medium">{view.driver?.name ?? "Unassigned"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Vehicle</dt>
                    <dd className="mt-1 font-medium">{view.vehicle?.displayName ?? "Unassigned"}</dd>
                  </div>
                </dl>
              </section>
              <section>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Journey</h3>
                <dl className="mt-3 space-y-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Pickup</dt>
                    <dd className="mt-1 font-medium">{view.pickupStop?.name ?? "Unavailable"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Destination</dt>
                    <dd className="mt-1 font-medium">{view.dropoffStop?.name ?? "Unavailable"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Seat</dt>
                    <dd className="mt-1 font-medium">{booking.seatNumber ?? "—"}</dd>
                  </div>
                </dl>
              </section>
              {view.canCancel ? (
                <Button type="button" variant="destructive" className="h-11 w-full" onClick={() => onCancel(row)}>
                  Cancel booking
                </Button>
              ) : row.cancelBlockReason ? (
                <p className="rounded-md border border-border bg-muted px-3 py-3 text-sm">{row.cancelBlockReason}</p>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
