import { findDriverAssignmentConflicts } from "@/lib/validation/domain";
import { deriveDriverStatus } from "@/services/driver-status";
import { driverService } from "@/services/driver-service";
import { routeService } from "@/services/route-service";
import { scheduleService } from "@/services/schedule-service";
import { tripService } from "@/services/trip-service";
import { vehicleService } from "@/services/vehicle-service";
import type { DriverStatus } from "@/types/driver";
import type { Trip } from "@/types/trip";

import { buildDriverTimeline, visibleWindow } from "./availability-timeline";
import type { DriverDayMetrics, DriverDayView, DriverFilters } from "./driver-types";

function indexById<T extends { id: string }>(records: readonly T[]): Map<string, T> {
  return new Map(records.map((record) => [record.id, record]));
}

export function loadDriverDay(date: string, now = new Date()): DriverDayView[] {
  const drivers = driverService.getAll();
  const schedules = scheduleService.getAll();
  const trips = tripService.getAll();
  const routes = indexById(routeService.getAll());
  const vehicles = indexById(vehicleService.getAll());
  const range = visibleWindow(schedules, trips, date);
  const scheduleByDriver = new Map(
    schedules.filter((schedule) => schedule.date === date).map((schedule) => [schedule.driverId, schedule]),
  );

  return drivers
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((driver) => {
      const schedule = scheduleByDriver.get(driver.id) ?? null;
      const dayTrips = trips.filter((trip) => trip.driverId === driver.id && trip.serviceDate === date);
      const tripViews = dayTrips
        .slice()
        .sort((left, right) => left.departureTime.localeCompare(right.departureTime))
        .map((trip) => ({
          trip,
          routeCode: routes.get(trip.routeId)?.code ?? "Route",
          routeName: routes.get(trip.routeId)?.name ?? "Unavailable",
          vehicleName: vehicles.get(trip.vehicleId)?.displayName ?? "Unassigned",
        }));

      return {
        driver,
        schedule,
        trips: tripViews,
        status: deriveDriverStatus(driver.id, dayTrips, schedule ?? undefined, now),
        conflicts: findDriverAssignmentConflicts(driver.id, date, schedule, trips),
        timeline: buildDriverTimeline(schedule, dayTrips, range, (trip: Trip) => routes.get(trip.routeId)?.code ?? "Trip"),
      };
    });
}

export function driverMetrics(views: readonly DriverDayView[]): DriverDayMetrics {
  const counts: Record<DriverStatus, number> = {
    available: 0,
    on_trip: 0,
    on_break: 0,
    off_duty: 0,
  };
  for (const view of views) {
    counts[view.status] += 1;
  }
  return {
    total: views.length,
    available: counts.available,
    onTrip: counts.on_trip,
    onBreak: counts.on_break,
    offDuty: counts.off_duty,
  };
}

export function filterDrivers(views: readonly DriverDayView[], filters: DriverFilters): DriverDayView[] {
  const query = filters.query.trim().toLowerCase();
  return views.filter((view) => {
    if (filters.status !== "all" && view.status !== filters.status) {
      return false;
    }
    if (!query) {
      return true;
    }
    return `${view.driver.name} ${view.driver.employeeId}`.toLowerCase().includes(query);
  });
}

export const driverStatusLabel: Record<DriverStatus, string> = {
  available: "Available",
  on_trip: "On trip",
  on_break: "On break",
  off_duty: "Off duty",
};
