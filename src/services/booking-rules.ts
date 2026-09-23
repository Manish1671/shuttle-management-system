import type { Booking } from "@/types/booking";
import type { Route } from "@/types/route";
import type { Trip } from "@/types/trip";
import type { User } from "@/types/user";
import { formatDateTimeStamp, hasDeparted } from "@/lib/time";
import { occupiesSeat, validatePickupAndDropoff } from "@/lib/validation/domain";
import type { ValidationError } from "@/lib/validation/result";

export type CreateBookingRequest = {
  userId: string;
  tripId: string;
  pickupStopId: string;
  dropoffStopId: string;
};

export type PreparedBooking = {
  booking: Booking;
  bookedSeats: number;
};

export type PrepareBookingResult =
  | { ok: true; value: PreparedBooking }
  | { ok: false; errors: ValidationError[] };

const BOOKABLE_STATUSES = new Set<Trip["status"]>(["scheduled", "boarding"]);

export function countOccupiedSeats(
  bookings: readonly Pick<Booking, "status">[],
): number {
  return bookings.filter(occupiesSeat).length;
}

export function availableSeats(
  trip: Pick<Trip, "capacity">,
  bookings: readonly Pick<Booking, "status">[],
): number {
  return Math.max(0, trip.capacity - countOccupiedSeats(bookings));
}

export function hasActiveBooking(
  userId: string,
  tripId: string,
  bookings: readonly Pick<Booking, "userId" | "tripId" | "status">[],
): boolean {
  return bookings.some(
    (booking) =>
      booking.userId === userId &&
      booking.tripId === tripId &&
      occupiesSeat(booking),
  );
}

export function isTripBookable(
  trip: Pick<Trip, "status" | "capacity" | "serviceDate" | "departureTime">,
  bookings: readonly Pick<Booking, "status">[],
  now = new Date(),
): boolean {
  if (!BOOKABLE_STATUSES.has(trip.status)) {
    return false;
  }

  if (
    trip.status === "scheduled" &&
    hasDeparted(trip.serviceDate, trip.departureTime, now)
  ) {
    return false;
  }

  return availableSeats(trip, bookings) > 0;
}

export function nextBookingId(bookings: readonly Pick<Booking, "id">[]): string {
  let highest = 1000;

  for (const booking of bookings) {
    const match = /^BK-(\d+)$/.exec(booking.id);
    if (!match?.[1]) {
      continue;
    }

    highest = Math.max(highest, Number(match[1]));
  }

  return `BK-${highest + 1}`;
}

export function nextSeatNumber(
  trip: Pick<Trip, "capacity">,
  bookings: readonly Pick<Booking, "status" | "seatNumber">[],
): number | undefined {
  const taken = new Set(
    bookings
      .filter(occupiesSeat)
      .map((booking) => booking.seatNumber)
      .filter((seat): seat is number => typeof seat === "number"),
  );

  for (let seat = 1; seat <= trip.capacity; seat += 1) {
    if (!taken.has(seat)) {
      return seat;
    }
  }

  return undefined;
}

function failure(code: string, message: string): PrepareBookingResult {
  return { ok: false, errors: [{ code, message }] };
}

export function prepareBooking(input: {
  request: CreateBookingRequest;
  user: User | null;
  trip: Trip | null;
  route: Route | null;
  tripBookings: readonly Booking[];
  existingBookings: readonly Pick<Booking, "id">[];
  now?: Date;
}): PrepareBookingResult {
  const now = input.now ?? new Date();
  const { request, user, trip, route, tripBookings } = input;

  if (!user || user.id !== request.userId) {
    return failure("USER_NOT_FOUND", "Your session could not be verified. Sign in again.");
  }

  if (!trip || trip.id !== request.tripId) {
    return failure(
      "TRIP_NOT_FOUND",
      "This shuttle is no longer available. Please choose another trip.",
    );
  }

  if (trip.status === "cancelled" || trip.status === "completed" || trip.status === "in_progress") {
    return failure(
      "TRIP_NOT_BOOKABLE",
      "This shuttle is no longer available. Please choose another trip.",
    );
  }

  if (!isTripBookable(trip, tripBookings, now)) {
    if (availableSeats(trip, tripBookings) <= 0) {
      return failure(
        "TRIP_FULL",
        "This shuttle is full. Please choose another trip.",
      );
    }

    return failure(
      "TRIP_NOT_BOOKABLE",
      "This shuttle is no longer available. Please choose another trip.",
    );
  }

  if (!route || route.id !== trip.routeId || !route.active) {
    return failure("ROUTE_NOT_FOUND", "This route is no longer available.");
  }

  const stopCheck = validatePickupAndDropoff(
    {
      id: "draft",
      pickupStopId: request.pickupStopId,
      dropoffStopId: request.dropoffStopId,
    },
    route,
  );

  if (!stopCheck.valid) {
    const missing = stopCheck.errors.some((item) => item.code === "BOOKING_STOP_REFERENCE");
    return failure(
      missing ? "BOOKING_STOP_REFERENCE" : "PICKUP_AFTER_DROPOFF",
      missing
        ? "Choose a pickup and destination on the selected route."
        : "The destination must come after the pickup on this route.",
    );
  }

  if (hasActiveBooking(request.userId, trip.id, tripBookings)) {
    return failure(
      "DUPLICATE_BOOKING",
      "You already have a booking for this shuttle.",
    );
  }

  const seatNumber = nextSeatNumber(trip, tripBookings);
  const booking: Booking = {
    id: nextBookingId(input.existingBookings),
    userId: request.userId,
    tripId: trip.id,
    pickupStopId: request.pickupStopId,
    dropoffStopId: request.dropoffStopId,
    bookedAt: formatDateTimeStamp(now),
    status: "confirmed",
    seatNumber,
  };

  return {
    ok: true,
    value: {
      booking,
      bookedSeats: countOccupiedSeats([...tripBookings, booking]),
    },
  };
}

export type BookingSection = "upcoming" | "past" | "cancelled";

export function classifyBooking(
  booking: Pick<Booking, "status">,
  trip: Pick<Trip, "status" | "serviceDate" | "departureTime"> | null,
  now = new Date(),
): BookingSection {
  if (booking.status === "cancelled") {
    return "cancelled";
  }

  if (!trip || booking.status === "completed" || trip.status === "completed" || trip.status === "cancelled") {
    return "past";
  }

  if (trip.status === "in_progress" || trip.status === "boarding") {
    return "upcoming";
  }

  if (trip.status === "scheduled" && !hasDeparted(trip.serviceDate, trip.departureTime, now)) {
    return "upcoming";
  }

  return "past";
}

export function cancellationError(
  booking: Pick<Booking, "id" | "userId" | "status"> | null,
  trip: Pick<Trip, "status" | "serviceDate" | "departureTime"> | null,
  userId: string,
  now = new Date(),
): ValidationError | null {
  if (!booking) {
    return { code: "BOOKING_NOT_FOUND", message: "This booking could not be found." };
  }

  if (booking.userId !== userId) {
    return { code: "NOT_OWNER", message: "You can only cancel your own booking." };
  }

  if (booking.status === "cancelled") {
    return { code: "ALREADY_CANCELLED", message: "This booking is already cancelled." };
  }

  if (booking.status === "completed" || trip?.status === "completed") {
    return { code: "TRIP_COMPLETED", message: "This trip is already completed." };
  }

  if (!trip) {
    return { code: "TRIP_NOT_FOUND", message: "This shuttle is no longer available." };
  }

  if (trip.status === "in_progress" || hasDeparted(trip.serviceDate, trip.departureTime, now)) {
    return { code: "TRIP_STARTED", message: "This shuttle has already started." };
  }

  if (trip.status === "boarding") {
    return { code: "TRIP_BOARDING", message: "This shuttle is already boarding." };
  }

  if (trip.status === "cancelled") {
    return { code: "TRIP_CANCELLED", message: "This trip is no longer running." };
  }

  if (trip.status !== "scheduled") {
    return { code: "NOT_CANCELLABLE", message: "This booking can no longer be cancelled." };
  }

  return null;
}
