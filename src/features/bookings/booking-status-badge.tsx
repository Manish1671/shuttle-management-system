import type { BookingStatus } from "@/types/booking";
import type { TripStatus } from "@/types/trip";

const bookingLabel: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  cancelled: "Cancelled",
  completed: "Completed",
};

const tripLabel: Record<TripStatus, string> = {
  scheduled: "Scheduled",
  boarding: "Boarding",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const classNameFor: Record<string, string> = {
  confirmed: "border-success/30 bg-success/10 text-success",
  pending: "border-warning/30 bg-warning/10 text-warning",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
  completed: "border-border bg-muted text-muted-foreground",
  scheduled: "border-info/30 bg-info/10 text-info",
  boarding: "border-warning/30 bg-warning/10 text-warning",
  in_progress: "border-info/30 bg-info/10 text-info",
};

type BookingStatusBadgeProps = {
  status: BookingStatus | TripStatus;
  kind?: "booking" | "trip";
};

export function BookingStatusBadge({ status, kind = "booking" }: BookingStatusBadgeProps) {
  const label = kind === "trip" ? tripLabel[status as TripStatus] : bookingLabel[status as BookingStatus];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${classNameFor[status] ?? classNameFor.completed}`}
    >
      {label}
    </span>
  );
}
