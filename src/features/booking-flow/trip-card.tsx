import { Button } from "@/components/ui/button";
import type { BookableTrip } from "@/services/booking-service";
import type { TripStatus } from "@/types/trip";

const statusLabel: Record<TripStatus, string> = {
  scheduled: "Scheduled",
  boarding: "Boarding",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusClassName: Record<TripStatus, string> = {
  scheduled: "bg-secondary text-secondary-foreground",
  boarding: "bg-warning/15 text-warning",
  in_progress: "bg-info/15 text-info",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

type TripCardProps = {
  option: BookableTrip;
  pickupName: string;
  dropoffName: string;
  onSelect: (option: BookableTrip) => void;
};

export function TripCard({ option, pickupName, dropoffName, onSelect }: TripCardProps) {
  const { trip } = option;
  const seatLabel =
    option.availableSeats === 1
      ? "1 seat available"
      : `${option.availableSeats} seats available`;

  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-semibold tracking-tight">
          {trip.departureTime}
          <span className="px-1.5 font-normal text-muted-foreground">—</span>
          {trip.arrivalTime}
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[trip.status]}`}
        >
          {statusLabel[trip.status]}
        </span>
      </div>
      <p className="mt-2 text-sm text-foreground">
        {pickupName}
        <span className="px-1 text-muted-foreground">→</span>
        {dropoffName}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {option.routeCode} · {option.routeName}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Driver</dt>
          <dd className="font-medium">{option.driverName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Vehicle</dt>
          <dd className="font-medium">{option.vehicleName}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-muted-foreground">{seatLabel}</p>
      <Button
        type="button"
        className="mt-4 h-11 w-full"
        onClick={() => onSelect(option)}
      >
        Select shuttle
      </Button>
    </article>
  );
}
