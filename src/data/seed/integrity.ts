import type { Booking } from "@/types/booking";
import type { Driver } from "@/types/driver";
import type { DriverSchedule } from "@/types/schedule";
import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";
import type { Trip } from "@/types/trip";
import type { User } from "@/types/user";
import type { Vehicle } from "@/types/vehicle";
import { isDateString, isDateTimeString, parseTimeToMinutes, rangesOverlap } from "@/lib/time";
import {
  findTripOverlaps,
  occupiesSeat,
  validateDriverSchedule,
  validatePickupAndDropoff,
  validateRouteStops,
  validateTripCapacity,
} from "@/lib/validation/domain";
import {
  validationResult,
  type ValidationError,
  type ValidationResult,
} from "@/lib/validation/result";

export type CampusDataset = {
  users: readonly User[];
  drivers: readonly Driver[];
  vehicles: readonly Vehicle[];
  stops: readonly Stop[];
  routes: readonly Route[];
  trips: readonly Trip[];
  bookings: readonly Booking[];
  driverSchedules: readonly DriverSchedule[];
};

function duplicateIds(label: string, ids: readonly string[]): ValidationError[] {
  const seen = new Set<string>();
  const errors: ValidationError[] = [];

  for (const id of ids) {
    if (seen.has(id)) {
      errors.push({
        code: "DUPLICATE_ID",
        message: `${label} id ${id} is duplicated.`,
      });
    }
    seen.add(id);
  }

  return errors;
}

export function validateDataset(data: CampusDataset): ValidationResult {
  const errors: ValidationError[] = [
    ...duplicateIds("User", data.users.map((item) => item.id)),
    ...duplicateIds("Driver", data.drivers.map((item) => item.id)),
    ...duplicateIds("Vehicle", data.vehicles.map((item) => item.id)),
    ...duplicateIds("Stop", data.stops.map((item) => item.id)),
    ...duplicateIds("Route", data.routes.map((item) => item.id)),
    ...duplicateIds("Trip", data.trips.map((item) => item.id)),
    ...duplicateIds("Booking", data.bookings.map((item) => item.id)),
    ...duplicateIds("Schedule", data.driverSchedules.map((item) => item.id)),
  ];

  const users = new Set(data.users.map((item) => item.id));
  const drivers = new Map(data.drivers.map((item) => [item.id, item]));
  const vehicles = new Map(data.vehicles.map((item) => [item.id, item]));
  const routes = new Map(data.routes.map((item) => [item.id, item]));
  const trips = new Map(data.trips.map((item) => [item.id, item]));

  for (const route of data.routes) {
    errors.push(...validateRouteStops(route, data.stops).errors);
  }

  for (const driver of data.drivers) {
    if (driver.assignedVehicleId && !vehicles.has(driver.assignedVehicleId)) {
      errors.push({
        code: "VEHICLE_REFERENCE",
        message: `Driver ${driver.id} is assigned unknown vehicle ${driver.assignedVehicleId}.`,
      });
    }
  }

  for (const trip of data.trips) {
    if (!isDateString(trip.serviceDate)) {
      errors.push({
        code: "TRIP_TIME_INVALID",
        message: `Trip ${trip.id} service date is not YYYY-MM-DD.`,
      });
    }

    const route = routes.get(trip.routeId);
    const vehicle = vehicles.get(trip.vehicleId);
    const driver = drivers.get(trip.driverId);

    if (!route) {
      errors.push({
        code: "ROUTE_REFERENCE",
        message: `Trip ${trip.id} references unknown route ${trip.routeId}.`,
      });
    }

    if (!driver) {
      errors.push({
        code: "TRIP_DRIVER_REFERENCE",
        message: `Trip ${trip.id} references unknown driver ${trip.driverId}.`,
      });
    }

    if (!vehicle) {
      errors.push({
        code: "TRIP_VEHICLE_REFERENCE",
        message: `Trip ${trip.id} references unknown vehicle ${trip.vehicleId}.`,
      });
    } else if (trip.capacity !== vehicle.capacity) {
      errors.push({
        code: "TRIP_CAPACITY_EXCEEDED",
        message: `Trip ${trip.id} capacity ${trip.capacity} does not match vehicle ${vehicle.id} capacity ${vehicle.capacity}.`,
      });
    }

    const tripBookings = data.bookings.filter((booking) => booking.tripId === trip.id);
    errors.push(...validateTripCapacity(trip, tripBookings).errors);
  }

  for (const booking of data.bookings) {
    if (!isDateTimeString(booking.bookedAt)) {
      errors.push({
        code: "BOOKING_TIME_INVALID",
        message: `Booking ${booking.id} bookedAt is not YYYY-MM-DDTHH:mm.`,
      });
    }

    if (!users.has(booking.userId)) {
      errors.push({
        code: "BOOKING_USER_REFERENCE",
        message: `Booking ${booking.id} references unknown user ${booking.userId}.`,
      });
    }

    const trip = trips.get(booking.tripId);
    if (!trip) {
      errors.push({
        code: "BOOKING_TRIP_REFERENCE",
        message: `Booking ${booking.id} references unknown trip ${booking.tripId}.`,
      });
      continue;
    }

    const route = routes.get(trip.routeId);
    if (route) {
      errors.push(...validatePickupAndDropoff(booking, route).errors);
    }

    if (booking.status === "cancelled" && occupiesSeat(booking)) {
      errors.push({
        code: "BOOKED_SEATS_MISMATCH",
        message: `Booking ${booking.id} is cancelled but still occupies a seat.`,
      });
    }
  }

  for (const driver of data.drivers) {
    const assigned = data.trips.filter((trip) => trip.driverId === driver.id);
    errors.push(...validateDriverTripOverlap(driver.id, assigned).errors);
  }

  for (const vehicle of data.vehicles) {
    const assigned = data.trips.filter((trip) => trip.vehicleId === vehicle.id);
    errors.push(...validateVehicleTripOverlap(vehicle.id, assigned).errors);
  }

  const schedulesByDriverDate = new Map<string, DriverSchedule>();

  for (const schedule of data.driverSchedules) {
    if (!drivers.has(schedule.driverId)) {
      errors.push({
        code: "SCHEDULE_DRIVER_REFERENCE",
        message: `Schedule ${schedule.id} references unknown driver ${schedule.driverId}.`,
      });
    }

    if (!isDateString(schedule.date)) {
      errors.push({
        code: "DUTY_TIME_INVALID",
        message: `Schedule ${schedule.id} date is not YYYY-MM-DD.`,
      });
    }

    const key = `${schedule.driverId}|${schedule.date}`;
    if (schedulesByDriverDate.has(key)) {
      errors.push({
        code: "DUPLICATE_ID",
        message: `Driver ${schedule.driverId} has more than one schedule on ${schedule.date}.`,
      });
    }
    schedulesByDriverDate.set(key, schedule);
    errors.push(...validateDriverSchedule(schedule).errors);
  }

  for (const trip of data.trips) {
    if (trip.status === "cancelled") {
      continue;
    }

    const schedule = schedulesByDriverDate.get(`${trip.driverId}|${trip.serviceDate}`);
    if (!schedule) {
      errors.push({
        code: "DRIVER_SCHEDULE_CONFLICT",
        message: `Trip ${trip.id} has no duty schedule for driver ${trip.driverId} on ${trip.serviceDate}.`,
      });
      continue;
    }

    const dutyStart = parseTimeToMinutes(schedule.dutyStart);
    const dutyEnd = parseTimeToMinutes(schedule.dutyEnd);
    const departure = parseTimeToMinutes(trip.departureTime);
    const arrival = parseTimeToMinutes(trip.arrivalTime);

    if (
      dutyStart === null ||
      dutyEnd === null ||
      departure === null ||
      arrival === null ||
      departure < dutyStart ||
      arrival > dutyEnd
    ) {
      errors.push({
        code: "DRIVER_SCHEDULE_CONFLICT",
        message: `Trip ${trip.id} falls outside duty ${schedule.dutyStart}–${schedule.dutyEnd}.`,
      });
    }

    for (const item of schedule.breaks) {
      const breakStart = parseTimeToMinutes(item.startTime);
      const breakEnd = parseTimeToMinutes(item.endTime);
      if (
        breakStart !== null &&
        breakEnd !== null &&
        departure !== null &&
        arrival !== null &&
        rangesOverlap(departure, arrival, breakStart, breakEnd)
      ) {
        errors.push({
          code: "BREAK_OVERLAP",
          message: `Trip ${trip.id} overlaps break ${item.id}.`,
        });
      }
    }
  }

  return validationResult(errors);
}

function validateDriverTripOverlap(
  driverId: string,
  assigned: readonly Trip[],
): ValidationResult {
  return validationResult(
    findTripOverlaps(assigned, "DRIVER_TRIP_OVERLAP", `Driver ${driverId}`),
  );
}

function validateVehicleTripOverlap(
  vehicleId: string,
  assigned: readonly Trip[],
): ValidationResult {
  return validationResult(
    findTripOverlaps(assigned, "VEHICLE_TRIP_OVERLAP", `Vehicle ${vehicleId}`),
  );
}
