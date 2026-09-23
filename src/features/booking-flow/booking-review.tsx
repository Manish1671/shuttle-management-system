import { ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/time";
import type { BookableTrip } from "@/services/booking-service";

export type BookingDraftView = {
  passengerName: string;
  option: BookableTrip;
  pickupName: string;
  dropoffName: string;
  pickupStopId: string;
  dropoffStopId: string;
};

type BookingReviewProps = {
  draft: BookingDraftView;
  pending: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

export function BookingReview({ draft, pending, onBack, onConfirm }: BookingReviewProps) {
  const { option } = draft;

  return (
    <section className="mx-auto w-full max-w-xl rounded-lg border border-border bg-card p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">Review your journey</h2>
      <dl className="mt-5 space-y-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Passenger</dt>
          <dd className="mt-1 font-medium">{draft.passengerName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Journey</dt>
          <dd className="mt-2">
            <p className="font-medium">{draft.pickupName}</p>
            <ArrowDown className="my-1 size-4 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">{draft.dropoffName}</p>
          </dd>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-muted-foreground">Date</dt>
            <dd className="mt-1 font-medium">{formatDisplayDate(option.trip.serviceDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Seats left</dt>
            <dd className="mt-1 font-medium">{option.availableSeats}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Departure</dt>
            <dd className="mt-1 font-medium">{option.trip.departureTime}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Arrival</dt>
            <dd className="mt-1 font-medium">{option.trip.arrivalTime}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Driver</dt>
            <dd className="mt-1 font-medium">{option.driverName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Vehicle</dt>
            <dd className="mt-1 font-medium">{option.vehicleName}</dd>
          </div>
        </div>
      </dl>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={onBack}
          disabled={pending}
        >
          Back
        </Button>
        <Button type="button" className="h-11" onClick={onConfirm} disabled={pending}>
          {pending ? "Confirming booking..." : "Confirm booking"}
        </Button>
      </div>
    </section>
  );
}
