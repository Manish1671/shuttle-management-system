import { formatUtilization } from "@/features/admin-dashboard/dashboard-metrics";
import { todayDateString } from "@/lib/time";
import {
  findDriverAssignmentConflicts,
  validateVehicleTripOverlap,
} from "@/lib/validation/domain";
import type { ValidationError } from "@/lib/validation/result";
import { bookingService } from "@/services/booking-service";
import { driverService } from "@/services/driver-service";
import { routeService } from "@/services/route-service";
import { scheduleService } from "@/services/schedule-service";
import { stopService } from "@/services/stop-service";
import { plannedArrival, tripService } from "@/services/trip-service";
import { vehicleService } from "@/services/vehicle-service";
import type { Driver } from "@/types/driver";
import type { DriverSchedule } from "@/types/schedule";
import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";
import type { Trip } from "@/types/trip";
import type { Vehicle } from "@/types/vehicle";

import type { AssignmentOption, TripFilters, TripMetrics } from "./trip-types";

function introducedErrors(before: readonly ValidationError[], after: readonly ValidationError[]): ValidationError[] {
  return after.filter(
    (error) => !before.some((item) => item.code === error.code && item.message === error.message),
  );
}

export type TripViewModel = {
  trip: Trip;
  route: Route | null;
  stops: Stop[];
  driver: Driver | null;
  vehicle: Vehicle | null;
  occupied: number;
  availableSeats: number;
  utilizationLabel: string;
};

export type TripManagementData = {
  trips: TripViewModel[];
  routes: Route[];
  stops: Stop[];
  drivers: Driver[];
  vehicles: Vehicle[];
  schedules: DriverSchedule[];
};

function indexById<T extends { id: string }>(records: readonly T[]): Map<string, T> {
  return new Map(records.map((record) => [record.id, record]));
}

export function loadTripManagement(): TripManagementData {
  const stops = indexById(stopService.getAll());
  const routes = indexById(routeService.getAll());
  const drivers = indexById(driverService.getAll());
  const vehicles = indexById(vehicleService.getAll());
  const occupiedByTrip = new Map<string, number>();

  for (const booking of bookingService.getAll()) {
    if (booking.status === "cancelled") {
      continue;
    }
    occupiedByTrip.set(booking.tripId, (occupiedByTrip.get(booking.tripId) ?? 0) + 1);
  }

  const trips = tripService.getAll().map((trip) => {
    const route = routes.get(trip.routeId) ?? null;
    const occupied = occupiedByTrip.get(trip.id) ?? 0;
    return {
      trip,
      route,
      stops: route
        ? route.stopIds.flatMap((stopId) => {
            const stop = stops.get(stopId);
            return stop ? [stop] : [];
          })
        : [],
      driver: drivers.get(trip.driverId) ?? null,
      vehicle: vehicles.get(trip.vehicleId) ?? null,
      occupied,
      availableSeats: Math.max(0, trip.capacity - occupied),
      utilizationLabel: formatUtilization(occupied, trip.capacity),
    };
  });

  return {
    trips,
    routes: [...routes.values()].sort((left, right) => left.code.localeCompare(right.code)),
    stops: [...stops.values()],
    drivers: [...drivers.values()].sort((left, right) => left.name.localeCompare(right.name)),
    vehicles: [...vehicles.values()].sort((left, right) =>
      left.registrationNumber.localeCompare(right.registrationNumber),
    ),
    schedules: scheduleService.getAll(),
  };
}

export function tripMetrics(trips: readonly TripViewModel[], now = new Date()): TripMetrics {
  const today = todayDateString(now);
  const todayTrips = trips.filter((view) => view.trip.serviceDate === today);
  return {
    today: todayTrips.length,
    scheduled: todayTrips.filter((view) => view.trip.status === "scheduled").length,
    active: todayTrips.filter(
      (view) => view.trip.status === "boarding" || view.trip.status === "in_progress",
    ).length,
    completed: todayTrips.filter((view) => view.trip.status === "completed").length,
    cancelled: todayTrips.filter((view) => view.trip.status === "cancelled").length,
  };
}

function compareOperational(left: TripViewModel, right: TripViewModel): number {
  const date = left.trip.serviceDate.localeCompare(right.trip.serviceDate);
  if (date !== 0) {
    return date;
  }
  const time = left.trip.departureTime.localeCompare(right.trip.departureTime);
  if (time !== 0) {
    return time;
  }
  return left.trip.id.localeCompare(right.trip.id);
}

export function visibleTrips(
  trips: readonly TripViewModel[],
  filters: TripFilters,
  now = new Date(),
): TripViewModel[] {
  const today = todayDateString(now);
  const query = filters.query.trim().toLowerCase();
  const matched = trips.filter((view) => {
    if (filters.date === "today" && view.trip.serviceDate !== today) {
      return false;
    }
    if (filters.date === "upcoming" && view.trip.serviceDate <= today) {
      return false;
    }
    if (filters.date === "past" && view.trip.serviceDate >= today) {
      return false;
    }
    if (filters.status !== "all" && view.trip.status !== filters.status) {
      return false;
    }
    if (filters.routeId !== "all" && view.trip.routeId !== filters.routeId) {
      return false;
    }
    if (filters.driverId !== "all" && view.trip.driverId !== filters.driverId) {
      return false;
    }
    if (filters.vehicleId !== "all" && view.trip.vehicleId !== filters.vehicleId) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack = [
      view.trip.id,
      view.route?.name,
      view.route?.code,
      view.route?.id,
      view.driver?.name,
      view.driver?.employeeId,
      view.vehicle?.registrationNumber,
      view.vehicle?.displayName,
      view.vehicle?.id,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  const sorted = [...matched].sort(compareOperational);
  if (filters.date === "past") {
    sorted.reverse();
  }
  return sorted;
}

export type TripPlan = {
  serviceDate: string;
  departureTime: string;
  routeId: string;
  existingId?: string;
};

function candidateTrip(
  plan: TripPlan,
  existing: Trip | null,
  route: Route,
  driverId: string,
  vehicleId: string,
  arrivalTime: string,
): Trip {
  return {
    id: existing?.id ?? "trip_preview",
    routeId: route.id,
    driverId,
    vehicleId,
    serviceDate: plan.serviceDate,
    departureTime: plan.departureTime.slice(0, 5),
    arrivalTime,
    capacity: existing?.capacity ?? 0,
    bookedSeats: existing?.bookedSeats ?? 0,
    status: existing?.status ?? "scheduled",
  };
}

function driverState(code: string | undefined): AssignmentOption["state"] {
  if (code === "DRIVER_TRIP_OVERLAP") {
    return "On trip";
  }
  if (code === "TRIP_DURING_BREAK") {
    return "On break";
  }
  if (code === "DRIVER_SCHEDULE_CONFLICT") {
    return "Off duty";
  }
  if (code) {
    return "Conflict";
  }
  return "Available";
}

export function driverAssignmentOptions(
  data: TripManagementData,
  plan: TripPlan,
): AssignmentOption[] {
  const route = data.routes.find((item) => item.id === plan.routeId) ?? null;
  const existing = data.trips.find((view) => view.trip.id === plan.existingId)?.trip ?? null;
  const arrival = route ? plannedArrival(route, plan.departureTime, existing) : null;
  const trips = data.trips.map((view) => view.trip);

  return data.drivers.map((driver) => {
    const schedule =
      data.schedules.find((item) => item.driverId === driver.id && item.date === plan.serviceDate) ??
      null;
    const duty = schedule ? `${schedule.dutyStart}–${schedule.dutyEnd}` : "No duty schedule";
    if (!route || !arrival) {
      return {
        id: driver.id,
        title: driver.name,
        state: "Conflict",
        duty,
        detail: "Choose a route and a departure time first.",
        selectable: false,
      };
    }

    const candidate = candidateTrip(plan, existing, route, driver.id, existing?.vehicleId ?? "vehicle_preview", arrival);
    const dayTrips = trips.filter(
      (trip) => trip.id !== candidate.id && trip.driverId === driver.id && trip.serviceDate === plan.serviceDate,
    );
    const errors = introducedErrors(
      findDriverAssignmentConflicts(driver.id, plan.serviceDate, schedule, dayTrips),
      findDriverAssignmentConflicts(driver.id, plan.serviceDate, schedule, [...dayTrips, candidate]),
    );
    const primary = errors[0];
    return {
      id: driver.id,
      title: `${driver.name} · ${driver.employeeId}`,
      state: driverState(primary?.code),
      duty,
      detail: primary?.message ?? "No conflict",
      selectable: errors.length === 0,
    };
  });
}

export function vehicleAssignmentOptions(
  data: TripManagementData,
  plan: TripPlan,
): AssignmentOption[] {
  const route = data.routes.find((item) => item.id === plan.routeId) ?? null;
  const existing = data.trips.find((view) => view.trip.id === plan.existingId)?.trip ?? null;
  const arrival = route ? plannedArrival(route, plan.departureTime, existing) : null;
  const trips = data.trips.map((view) => view.trip);

  return data.vehicles.map((vehicle) => {
    const kept = existing?.vehicleId === vehicle.id;
    const title = `${vehicle.registrationNumber} · ${vehicle.capacity} seats`;
    if (!route || !arrival) {
      return {
        id: vehicle.id,
        title,
        state: "Conflict",
        duty: vehicle.displayName,
        detail: "Choose a route and a departure time first.",
        selectable: false,
      };
    }
    if (vehicle.status !== "active" && !kept) {
      return {
        id: vehicle.id,
        title,
        state: "Conflict",
        duty: vehicle.displayName,
        detail: vehicle.status === "maintenance" ? "In maintenance" : "Inactive",
        selectable: false,
      };
    }

    const candidate = candidateTrip(
      plan,
      existing,
      route,
      existing?.driverId ?? "driver_preview",
      vehicle.id,
      arrival,
    );
    const vehicleTrips = trips.filter((trip) => trip.id !== candidate.id && trip.vehicleId === vehicle.id);
    const errors = introducedErrors(
      validateVehicleTripOverlap(vehicle.id, vehicleTrips).errors,
      validateVehicleTripOverlap(vehicle.id, [...vehicleTrips, candidate]).errors,
    );
    return {
      id: vehicle.id,
      title,
      state: errors.length > 0 ? "Conflict" : "Available",
      duty: vehicle.displayName,
      detail: errors[0]?.message ?? "No conflict",
      selectable: errors.length === 0,
    };
  });
}
