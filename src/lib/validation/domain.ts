import type { Booking } from "@/types/booking";
import type { DriverSchedule } from "@/types/schedule";
import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";
import type { Trip } from "@/types/trip";
import { parseTimeToMinutes, rangesOverlap } from "@/lib/time";

import { validationResult, type ValidationError, type ValidationResult } from "./result";

export type { ValidationError, ValidationResult };

function error(code: string, message: string): ValidationError {
  return { code, message };
}

export function validateRouteStops(
  route: Route,
  stops: readonly Stop[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const known = new Set(stops.map((stop) => stop.id));

  if (route.stopIds.length < 2) {
    errors.push(
      error(
        "ROUTE_STOP_ORDER",
        `Route ${route.code} needs at least two stops.`,
      ),
    );
  }

  route.stopIds.forEach((stopId, index) => {
    if (!known.has(stopId)) {
      errors.push(
        error(
          "ROUTE_STOP_REFERENCE",
          `Route ${route.code} references unknown stop ${stopId}.`,
        ),
      );
    }

    if (index > 0 && route.stopIds[index - 1] === stopId) {
      errors.push(
        error(
          "ROUTE_STOP_ORDER",
          `Route ${route.code} repeats stop ${stopId} in a row.`,
        ),
      );
    }
  });

  return validationResult(errors);
}

export function validatePickupAndDropoff(
  booking: Pick<Booking, "id" | "pickupStopId" | "dropoffStopId">,
  route: Pick<Route, "code" | "stopIds">,
): ValidationResult {
  const errors: ValidationError[] = [];
  const pickupIndex = route.stopIds.indexOf(booking.pickupStopId);
  const dropoffIndex = route.stopIds.indexOf(booking.dropoffStopId);

  if (pickupIndex === -1) {
    errors.push(
      error(
        "BOOKING_STOP_REFERENCE",
        `Booking ${booking.id} pickup ${booking.pickupStopId} is not on route ${route.code}.`,
      ),
    );
  }

  if (dropoffIndex === -1) {
    errors.push(
      error(
        "BOOKING_STOP_REFERENCE",
        `Booking ${booking.id} drop-off ${booking.dropoffStopId} is not on route ${route.code}.`,
      ),
    );
  }

  if (pickupIndex !== -1 && dropoffIndex !== -1 && pickupIndex >= dropoffIndex) {
    errors.push(
      error(
        "PICKUP_AFTER_DROPOFF",
        `Booking ${booking.id} picks up at or after the drop-off on route ${route.code}.`,
      ),
    );
  }

  return validationResult(errors);
}

/** Cancelled bookings do not occupy a seat. */
export function occupiesSeat(booking: Pick<Booking, "status">): boolean {
  return booking.status !== "cancelled";
}

export function validateTripCapacity(
  trip: Pick<Trip, "id" | "capacity" | "bookedSeats">,
  bookings: readonly Pick<Booking, "status">[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const occupied = bookings.filter(occupiesSeat).length;

  if (occupied > trip.capacity) {
    errors.push(
      error(
        "TRIP_CAPACITY_EXCEEDED",
        `Trip ${trip.id} has ${occupied} occupied seats and capacity ${trip.capacity}.`,
      ),
    );
  }

  if (trip.bookedSeats !== occupied) {
    errors.push(
      error(
        "BOOKED_SEATS_MISMATCH",
        `Trip ${trip.id} records ${trip.bookedSeats} booked seats but ${occupied} bookings occupy a seat.`,
      ),
    );
  }

  if (trip.bookedSeats > trip.capacity) {
    errors.push(
      error(
        "TRIP_CAPACITY_EXCEEDED",
        `Trip ${trip.id} bookedSeats ${trip.bookedSeats} exceeds capacity ${trip.capacity}.`,
      ),
    );
  }

  return validationResult(errors);
}

export function validateDriverSchedule(schedule: DriverSchedule): ValidationResult {
  const errors: ValidationError[] = [];
  const dutyStart = parseTimeToMinutes(schedule.dutyStart);
  const dutyEnd = parseTimeToMinutes(schedule.dutyEnd);

  if (dutyStart === null || dutyEnd === null) {
    errors.push(
      error(
        "DUTY_TIME_INVALID",
        `Schedule ${schedule.id} has a duty time that is not HH:mm.`,
      ),
    );
    return validationResult(errors);
  }

  if (dutyEnd <= dutyStart) {
    errors.push(
      error(
        "DUTY_TIME_INVALID",
        `Schedule ${schedule.id} ends at or before it starts.`,
      ),
    );
  }

  const breakRanges: { id: string; start: number; end: number }[] = [];

  for (const item of schedule.breaks) {
    const start = parseTimeToMinutes(item.startTime);
    const end = parseTimeToMinutes(item.endTime);

    if (item.driverScheduleId !== schedule.id) {
      errors.push(
        error(
          "BREAK_REFERENCE",
          `Break ${item.id} points at schedule ${item.driverScheduleId} instead of ${schedule.id}.`,
        ),
      );
    }

    if (start === null || end === null || end <= start) {
      errors.push(
        error(
          "BREAK_OUTSIDE_DUTY",
          `Break ${item.id} has an invalid time range.`,
        ),
      );
      continue;
    }

    if (start < dutyStart || end > dutyEnd) {
      errors.push(
        error(
          "BREAK_OUTSIDE_DUTY",
          `Break ${item.id} is outside duty ${schedule.dutyStart}–${schedule.dutyEnd}.`,
        ),
      );
    }

    breakRanges.push({ id: item.id, start, end });
  }

  for (let index = 0; index < breakRanges.length; index += 1) {
    const current = breakRanges[index];
    if (!current) {
      continue;
    }

    for (let otherIndex = index + 1; otherIndex < breakRanges.length; otherIndex += 1) {
      const other = breakRanges[otherIndex];
      if (!other) {
        continue;
      }

      if (rangesOverlap(current.start, current.end, other.start, other.end)) {
        errors.push(
          error(
            "BREAK_OVERLAP",
            `Breaks ${current.id} and ${other.id} overlap on schedule ${schedule.id}.`,
          ),
        );
      }
    }
  }

  return validationResult(errors);
}

type TimedTrip = Pick<
  Trip,
  "id" | "serviceDate" | "departureTime" | "arrivalTime" | "status"
>;

/**
 * Cancelled trips do not occupy a driver or vehicle.
 * Overlap is checked per calendar date. Sorting is O(k log k); the scan is O(k).
 */
export function findTripOverlaps(
  trips: readonly TimedTrip[],
  code: "DRIVER_TRIP_OVERLAP" | "VEHICLE_TRIP_OVERLAP",
  label: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const active = trips.filter((trip) => trip.status !== "cancelled");
  const byDate = new Map<string, TimedTrip[]>();

  for (const trip of active) {
    const group = byDate.get(trip.serviceDate) ?? [];
    group.push(trip);
    byDate.set(trip.serviceDate, group);
  }

  for (const [date, group] of byDate) {
    const ranges = group.flatMap((trip) => {
      const start = parseTimeToMinutes(trip.departureTime);
      const end = parseTimeToMinutes(trip.arrivalTime);
      if (start === null || end === null || end <= start) {
        errors.push(
          error(
            "TRIP_TIME_INVALID",
            `Trip ${trip.id} has an invalid departure or arrival.`,
          ),
        );
        return [];
      }

      return [{ trip, start, end }];
    });

    ranges.sort((left, right) => left.start - right.start);

    for (let index = 1; index < ranges.length; index += 1) {
      const previous = ranges[index - 1];
      const current = ranges[index];
      if (!previous || !current) {
        continue;
      }

      if (rangesOverlap(previous.start, previous.end, current.start, current.end)) {
        errors.push(
          error(
            code,
            `${label} is assigned to overlapping trips ${previous.trip.id} and ${current.trip.id} on ${date}.`,
          ),
        );
      }
    }
  }

  return errors;
}

export function validateDriverTripOverlap(
  driverId: string,
  trips: readonly TimedTrip[],
): ValidationResult {
  return validationResult(
    findTripOverlaps(trips, "DRIVER_TRIP_OVERLAP", `Driver ${driverId}`),
  );
}

export function validateVehicleTripOverlap(
  vehicleId: string,
  trips: readonly TimedTrip[],
): ValidationResult {
  return validationResult(
    findTripOverlaps(trips, "VEHICLE_TRIP_OVERLAP", `Vehicle ${vehicleId}`),
  );
}
