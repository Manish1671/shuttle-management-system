import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/time";
import type { BookingViewModel } from "@/services/booking-view";

import { BookingStatusBadge } from "./booking-status-badge";

type BookingDetailsSheetProps = {
  view: BookingViewModel | null;
  onOpenChange: (open: boolean) => void;
  onCancel?: (view: BookingViewModel) => void;
};

function bookedAtLabel(value: string): string {
  const [date, time] = value.split("T");
  if (!date || !time) {
    return value;
  }

  return `${formatDisplayDate(date)} · ${time}`;
}

export function BookingDetailsSheet({ view, onOpenChange, onCancel }: BookingDetailsSheetProps) {
  const booking = view?.booking;
  const trip = view?.trip;

  return (
    <Sheet open={view !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {view && booking ? (
          <>
            <SheetHeader>
              <SheetTitle>Booking {booking.id}</SheetTitle>
              <SheetDescription>Reservation details for this shuttle.</SheetDescription>
            </SheetHeader>
            <dl className="space-y-4 px-4 pb-6 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <BookingStatusBadge status={booking.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Passenger</dt>
                <dd className="mt-1 font-medium">{view.passengerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Date</dt>
                <dd className="mt-1 font-medium">
                  {trip ? formatDisplayDate(trip.serviceDate) : "Unavailable"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Route</dt>
                <dd className="mt-1 font-medium">
                  {view.route ? `${view.route.code} · ${view.route.name}` : "Unavailable"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Pickup</dt>
                <dd className="mt-1 font-medium">{view.pickupStop?.name ?? "Unavailable"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Destination</dt>
                <dd className="mt-1 font-medium">{view.dropoffStop?.name ?? "Unavailable"}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Departure</dt>
                  <dd className="mt-1 font-medium">{trip?.departureTime ?? "--:--"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Arrival</dt>
                  <dd className="mt-1 font-medium">{trip?.arrivalTime ?? "--:--"}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Driver</dt>
                <dd className="mt-1 font-medium">{view.driver?.name ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Vehicle</dt>
                <dd className="mt-1 font-medium">{view.vehicle?.displayName ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Seat</dt>
                <dd className="mt-1 font-medium">{booking.seatNumber ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Booked at</dt>
                <dd className="mt-1 font-medium">{bookedAtLabel(booking.bookedAt)}</dd>
              </div>
            </dl>
            {onCancel && view.canCancel ? (
              <div className="px-4 pb-6">
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11 w-full"
                  onClick={() => onCancel(view)}
                >
                  Cancel booking
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
