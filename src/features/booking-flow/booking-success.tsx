import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/time";
import type { Booking } from "@/types/booking";

type BookingSuccessProps = {
  booking: Booking;
  pickupName: string;
  dropoffName: string;
  serviceDate: string;
  departureTime: string;
  onBookAnother: () => void;
};

export function BookingSuccess({
  booking,
  pickupName,
  dropoffName,
  serviceDate,
  departureTime,
  onBookAnother,
}: BookingSuccessProps) {
  return (
    <section
      className="mx-auto w-full max-w-xl rounded-lg border border-border bg-card p-5 shadow-card sm:p-6"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-success">Booking confirmed</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">
        Your shuttle has been reserved successfully.
      </h2>
      <dl className="mt-5 space-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Booking ID</dt>
          <dd className="mt-1 font-semibold">{booking.id}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Journey</dt>
          <dd className="mt-1 font-medium">
            {pickupName}
            <span className="px-1 text-muted-foreground">→</span>
            {dropoffName}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Departure</dt>
          <dd className="mt-1 font-medium">
            {departureTime}
            <span className="px-1 text-muted-foreground">·</span>
            {formatDisplayDate(serviceDate)}
          </dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="h-11">
          <Link href="/bookings">View my booking</Link>
        </Button>
        <Button type="button" variant="outline" className="h-11" onClick={onBookAnother}>
          Book another shuttle
        </Button>
      </div>
    </section>
  );
}
