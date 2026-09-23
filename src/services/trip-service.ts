import { addMinutesToTime, isDateString, isTimeString } from "@/lib/time";
import {
  findDriverAssignmentConflicts,
  tripStatusTransitionError,
  validatePickupAndDropoff,
  validateVehicleTripOverlap,
} from "@/lib/validation/domain";
import type { ValidationError } from "@/lib/validation/result";
import { countOccupiedSeats } from "@/services/booking-rules";
import { notifyBookingsChanged } from "@/services/booking-sync";
import { RepositoryError } from "@/services/repository/collection";
import type { Route } from "@/types/route";
import type { Trip, TripStatus } from "@/types/trip";

import {
  bookingRepository,
  driverRepository,
  routeRepository,
  scheduleRepository,
  tripRepository,
  vehicleRepository,
} from "./repository";

export type TripDraft = {
  id?: string;
  routeId: string;
  driverId: string;
  vehicleId: string;
  serviceDate: string;
  departureTime: string;
};

export type TripWriteResult =
  | { ok: true; trip: Trip }
  | { ok: false; errors: ValidationError[] };

function failure(code: string, message: string): TripWriteResult {
  return { ok: false, errors: [{ code, message }] };
}

function clock(value: string): string {
  return value.length >= 5 ? value.slice(0, 5) : value;
}

function nextTripId(): string {
  let highest = 0;
  for (const trip of tripRepository.getAll()) {
    const match = /^trip_(\d+)$/.exec(trip.id);
    if (!match?.[1]) {
      continue;
    }
    highest = Math.max(highest, Number(match[1]));
  }
  return `trip_${highest + 1}`;
}

/** Arrival stored on the trip. A new departure or route uses the route duration. */
export function plannedArrival(
  route: Pick<Route, "id" | "estimatedDurationMinutes">,
  departureTime: string,
  existing: Pick<Trip, "routeId" | "departureTime" | "arrivalTime"> | null,
): string | null {
  const departure = clock(departureTime);
  if (
    existing &&
    existing.routeId === route.id &&
    existing.departureTime === departure &&
    isTimeString(existing.arrivalTime)
  ) {
    return existing.arrivalTime;
  }

  return addMinutesToTime(departure, route.estimatedDurationMinutes);
}

function introducedErrors(before: readonly ValidationError[], after: readonly ValidationError[]): ValidationError[] {
  return after.filter(
    (error) => !before.some((item) => item.code === error.code && item.message === error.message),
  );
}

function persist(trip: Trip, creating: boolean): TripWriteResult {
  try {
    const saved = creating
      ? tripRepository.create(trip)
      : tripRepository.update(trip.id, {
          routeId: trip.routeId,
          vehicleId: trip.vehicleId,
          driverId: trip.driverId,
          serviceDate: trip.serviceDate,
          departureTime: trip.departureTime,
          arrivalTime: trip.arrivalTime,
          capacity: trip.capacity,
          bookedSeats: trip.bookedSeats,
          status: trip.status,
        });
    if (!saved) {
      return failure("REPOSITORY_FAILURE", "Unable to save this trip. Please try again.");
    }
    notifyBookingsChanged();
    return { ok: true, trip: saved };
  } catch (error) {
    if (error instanceof RepositoryError) {
      return failure("REPOSITORY_FAILURE", "Unable to save this trip. Please try again.");
    }
    throw error;
  }
}

export const tripService = {
  getAll(): Trip[] {
    return tripRepository.getAll();
  },
  getById(id: string): Trip | null {
    return tripRepository.getById(id);
  },
  create(trip: Trip): Trip {
    return tripRepository.create(trip);
  },
  update(id: string, patch: Partial<Omit<Trip, "id">>): Trip | null {
    return tripRepository.update(id, patch);
  },
  delete(id: string): boolean {
    return tripRepository.delete(id);
  },

  saveTrip(draft: TripDraft): TripWriteResult {
    const serviceDate = draft.serviceDate.trim();
    const departureTime = clock(draft.departureTime.trim());
    if (!isDateString(serviceDate)) {
      return failure("TRIP_DATE", "Choose a service date.");
    }
    if (!isTimeString(departureTime)) {
      return failure("TRIP_TIME", "Enter a departure time as HH:mm.");
    }

    const existing = draft.id ? tripRepository.getById(draft.id) : null;
    if (draft.id && !existing) {
      return failure("TRIP_NOT_FOUND", "This trip could not be found.");
    }

    const route = routeRepository.getById(draft.routeId);
    if (!route) {
      return failure("ROUTE_NOT_FOUND", "Choose a route.");
    }
    if (!route.active && existing?.routeId !== route.id) {
      return failure("ROUTE_INACTIVE", "Inactive routes cannot be used for a new trip.");
    }

    const driver = driverRepository.getById(draft.driverId);
    if (!driver) {
      return failure("DRIVER_NOT_FOUND", "Choose a driver.");
    }

    const vehicle = vehicleRepository.getById(draft.vehicleId);
    if (!vehicle) {
      return failure("VEHICLE_NOT_FOUND", "Choose a vehicle.");
    }
    if (vehicle.status !== "active" && existing?.vehicleId !== vehicle.id) {
      return failure("VEHICLE_UNAVAILABLE", "This vehicle is not available for assignment.");
    }
    if (!Number.isInteger(vehicle.capacity) || vehicle.capacity < 1) {
      return failure("VEHICLE_CAPACITY", "This vehicle does not have a usable seat capacity.");
    }
    if (existing && (existing.status === "completed" || existing.status === "cancelled")) {
      return failure(
        "NOT_ALLOWED",
        existing.status === "completed"
          ? "A completed trip cannot be edited."
          : "A cancelled trip cannot be edited.",
      );
    }

    const arrivalTime = plannedArrival(route, departureTime, existing);
    if (!arrivalTime) {
      return failure(
        "TRIP_TIME",
        "This departure is too late for the route duration. Choose an earlier time.",
      );
    }

    const tripBookings = bookingRepository.getAll().filter((booking) => booking.tripId === (existing?.id ?? ""));
    const occupied = countOccupiedSeats(tripBookings);
    if (occupied > vehicle.capacity) {
      return failure(
        "TRIP_CAPACITY_EXCEEDED",
        `This vehicle has ${vehicle.capacity} seats, but ${occupied} bookings already occupy this trip.`,
      );
    }

    if (existing && existing.routeId !== route.id) {
      const invalid = tripBookings.filter(
        (booking) => booking.status !== "cancelled" && !validatePickupAndDropoff(booking, route).valid,
      );
      if (invalid.length > 0) {
        const noun = invalid.length === 1 ? "booking uses" : "bookings use";
        return failure(
          "BOOKING_ROUTE_MISMATCH",
          `Trip cannot be updated because ${invalid.length} active ${noun} a stop that would be removed from this route.`,
        );
      }
    }

    const trip: Trip = {
      id: existing?.id ?? nextTripId(),
      routeId: route.id,
      vehicleId: vehicle.id,
      driverId: driver.id,
      serviceDate,
      departureTime,
      arrivalTime,
      capacity: vehicle.capacity,
      bookedSeats: occupied,
      status: existing?.status ?? "scheduled",
    };

    const others = tripRepository.getAll().filter((item) => item.id !== trip.id);
    const schedule =
      scheduleRepository
        .getAll()
        .find((item) => item.driverId === trip.driverId && item.date === trip.serviceDate) ?? null;
    const driverDay = others.filter(
      (item) => item.driverId === trip.driverId && item.serviceDate === trip.serviceDate,
    );
    const driverErrors = introducedErrors(
      findDriverAssignmentConflicts(trip.driverId, trip.serviceDate, schedule, driverDay),
      findDriverAssignmentConflicts(trip.driverId, trip.serviceDate, schedule, [...driverDay, trip]),
    );
    if (driverErrors.length > 0) {
      return { ok: false, errors: driverErrors };
    }

    const vehicleDay = others.filter((item) => item.vehicleId === trip.vehicleId);
    const vehicleErrors = introducedErrors(
      validateVehicleTripOverlap(trip.vehicleId, vehicleDay).errors,
      validateVehicleTripOverlap(trip.vehicleId, [...vehicleDay, trip]).errors,
    );
    if (vehicleErrors.length > 0) {
      return { ok: false, errors: vehicleErrors };
    }

    return persist(trip, !existing);
  },

  setTripStatus(id: string, status: TripStatus): TripWriteResult {
    const trip = tripRepository.getById(id);
    if (!trip) {
      return failure("TRIP_NOT_FOUND", "This trip could not be found.");
    }

    const transition = tripStatusTransitionError(trip.status, status);
    if (transition) {
      return { ok: false, errors: [transition] };
    }
    if (trip.status === status) {
      return { ok: true, trip };
    }

    return persist({ ...trip, status }, false);
  },
};
