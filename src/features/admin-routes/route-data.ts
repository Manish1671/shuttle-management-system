import { todayDateString } from "@/lib/time";
import { formatUtilization } from "@/services/operations-metrics";
import { occupiesSeat } from "@/lib/validation/domain";
import { bookingService } from "@/services/booking-service";
import { routeService } from "@/services/route-service";
import { stopService } from "@/services/stop-service";
import { tripService } from "@/services/trip-service";
import type { Stop } from "@/types/stop";

import type { RouteFilters, RouteMetrics, RouteViewModel } from "./route-types";

function indexById<T extends { id: string }>(records: readonly T[]): Map<string, T> {
  return new Map(records.map((record) => [record.id, record]));
}

export function loadRouteManagement(now = new Date()): { routes: RouteViewModel[]; stops: Stop[] } {
  const today = todayDateString(now);
  const stops = indexById(stopService.getAll());
  const trips = tripService.getAll();
  const bookings = bookingService.getAll();
  const tripsByRoute = new Map<string, typeof trips>();

  for (const trip of trips) {
    const list = tripsByRoute.get(trip.routeId);
    if (list) {
      list.push(trip);
    } else {
      tripsByRoute.set(trip.routeId, [trip]);
    }
  }

  const occupiedByTrip = new Map<string, number>();
  for (const booking of bookings) {
    if (!occupiesSeat(booking)) {
      continue;
    }
    occupiedByTrip.set(booking.tripId, (occupiedByTrip.get(booking.tripId) ?? 0) + 1);
  }

  const routes = routeService
    .getAll()
    .slice()
    .sort((left, right) => left.code.localeCompare(right.code))
    .map((route) => {
      const routeTrips = tripsByRoute.get(route.id) ?? [];
      const todayTrips = routeTrips.filter((trip) => trip.serviceDate === today);
      const operatingToday = todayTrips.filter((trip) => trip.status !== "cancelled");
      const booked = operatingToday.reduce((sum, trip) => sum + (occupiedByTrip.get(trip.id) ?? 0), 0);
      const capacity = operatingToday.reduce((sum, trip) => sum + trip.capacity, 0);
      return {
        route,
        stops: route.stopIds.flatMap((stopId) => {
          const stop = stops.get(stopId);
          return stop ? [stop] : [];
        }),
        todayTrips: todayTrips.length,
        upcomingTrips: routeTrips.filter(
          (trip) => trip.serviceDate > today && trip.status !== "cancelled" && trip.status !== "completed",
        ).length,
        todayBookings: booked,
        utilizationLabel: formatUtilization(booked, capacity),
      };
    });

  return {
    routes,
    stops: [...stops.values()].sort((left, right) => left.name.localeCompare(right.name)),
  };
}

export function routeMetrics(routes: readonly RouteViewModel[], stops: readonly Stop[]): RouteMetrics {
  const activeRoutes = routes.filter((view) => view.route.active).length;
  return {
    totalRoutes: routes.length,
    activeRoutes,
    inactiveRoutes: routes.length - activeRoutes,
    totalStops: stops.length,
  };
}

export function filterRoutes(routes: readonly RouteViewModel[], filters: RouteFilters): RouteViewModel[] {
  const query = filters.query.trim().toLowerCase();
  return routes.filter((view) => {
    if (filters.activity === "active" && !view.route.active) {
      return false;
    }
    if (filters.activity === "inactive" && view.route.active) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack = [view.route.name, view.route.code, view.route.id, ...view.stops.map((stop) => stop.name)]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
