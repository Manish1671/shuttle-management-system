import { todayDateString } from "@/lib/time";
import { deriveDriverStatus } from "@/services/driver-status";
import {
  CAPACITY_ATTENTION_RATIO,
  formatUtilization,
  hourlyDemand,
  isActiveTrip,
  peakDemand,
  utilizationByRoute,
} from "@/services/operations-metrics";
import { occupiesSeat } from "@/lib/validation/domain";
import type { Booking } from "@/types/booking";
import type { Driver } from "@/types/driver";
import type { DriverSchedule } from "@/types/schedule";
import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";
import type { Trip, TripStatus } from "@/types/trip";
import type { User } from "@/types/user";
import type { Vehicle } from "@/types/vehicle";

import type {
  AdminDashboard,
  DashboardAlert,
  DriverStatusCounts,
  RecentBookingRow,
  RouteUtilizationRow,
  TodayTripRow,
} from "./dashboard-types";

export { CAPACITY_ATTENTION_RATIO, formatUtilization };

const OPEN_TRIP_STATUSES = new Set<TripStatus>(["scheduled", "boarding", "in_progress"]);
const RECENT_BOOKING_LIMIT = 6;

export type DashboardRecords = {
  trips: readonly Trip[];
  bookings: readonly Booking[];
  drivers: readonly Driver[];
  vehicles: readonly Vehicle[];
  routes: readonly Route[];
  stops: readonly Stop[];
  users: readonly User[];
  schedules: readonly DriverSchedule[];
};

function indexById<T extends { id: string }>(records: readonly T[]): Map<string, T> {
  return new Map(records.map((record) => [record.id, record]));
}

function occupiedByTrip(bookings: readonly Booking[]): Map<string, Booking[]> {
  const grouped = new Map<string, Booking[]>();
  for (const booking of bookings) {
    if (!occupiesSeat(booking)) {
      continue;
    }

    const list = grouped.get(booking.tripId);
    if (list) {
      list.push(booking);
    } else {
      grouped.set(booking.tripId, [booking]);
    }
  }
  return grouped;
}

function buildAlerts(
  todayTrips: readonly Trip[],
  occupied: Map<string, Booking[]>,
  drivers: Map<string, Driver>,
  vehicles: Map<string, Vehicle>,
  routes: Map<string, Route>,
  schedulesByDriver: Map<string, DriverSchedule>,
  availableDrivers: number,
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  let needsAssignment = false;

  for (const trip of todayTrips) {
    const route = routes.get(trip.routeId);
    const routeLabel = route ? `${route.code} at ${trip.departureTime}` : trip.departureTime;

    if (trip.status === "cancelled") {
      alerts.push({
        id: `cancelled-${trip.id}`,
        title: "Cancelled trip",
        detail: `${routeLabel} is cancelled and is not operating.`,
      });
      continue;
    }

    if (OPEN_TRIP_STATUSES.has(trip.status)) {
      needsAssignment = true;
      const driver = drivers.get(trip.driverId);
      if (!driver) {
        alerts.push({
          id: `driver-missing-${trip.id}`,
          title: "Driver unavailable",
          detail: `${routeLabel} has no driver record.`,
        });
      } else if (!schedulesByDriver.has(driver.id)) {
        alerts.push({
          id: `driver-unscheduled-${trip.id}`,
          title: "Driver unavailable",
          detail: `${driver.name} is assigned to ${routeLabel} but has no duty schedule today.`,
        });
      }

      const vehicle = vehicles.get(trip.vehicleId);
      if (!vehicle || vehicle.status !== "active") {
        alerts.push({
          id: `vehicle-${trip.id}`,
          title: "Vehicle unavailable",
          detail: `${vehicle?.displayName ?? "The assigned vehicle"} on ${routeLabel} is ${vehicle?.status ?? "missing"}.`,
        });
      }

      const booked = occupied.get(trip.id)?.length ?? 0;
      if (trip.capacity > 0 && booked / trip.capacity >= CAPACITY_ATTENTION_RATIO) {
        alerts.push({
          id: `capacity-${trip.id}`,
          title: "Trip approaching capacity",
          detail: `${routeLabel} has ${booked} of ${trip.capacity} seats filled.`,
        });
      }
    }
  }

  if (needsAssignment && availableDrivers === 0) {
    alerts.push({
      id: "no-available-driver",
      title: "No available driver",
      detail: "No drivers are currently on duty and free for assignment.",
    });
  }

  return alerts;
}

export function buildAdminDashboard(records: DashboardRecords, now = new Date()): AdminDashboard {
  const serviceDate = todayDateString(now);
  const drivers = indexById(records.drivers);
  const vehicles = indexById(records.vehicles);
  const routes = indexById(records.routes);
  const stops = indexById(records.stops);
  const users = indexById(records.users);
  const occupied = occupiedByTrip(records.bookings);
  const schedulesByDriver = new Map(
    records.schedules
      .filter((schedule) => schedule.date === serviceDate)
      .map((schedule) => [schedule.driverId, schedule]),
  );

  const todayTrips = records.trips
    .filter((trip) => trip.serviceDate === serviceDate)
    .slice()
    .sort((left, right) => left.departureTime.localeCompare(right.departureTime));

  const driverStatus: DriverStatusCounts = {
    available: 0,
    on_trip: 0,
    on_break: 0,
    off_duty: 0,
  };

  for (const driver of records.drivers) {
    const status = deriveDriverStatus(
      driver.id,
      todayTrips,
      schedulesByDriver.get(driver.id),
      now,
    );
    driverStatus[status] += 1;
  }

  const tripRows: TodayTripRow[] = todayTrips.map((trip) => ({
    id: trip.id,
    departureTime: trip.departureTime,
    routeCode: routes.get(trip.routeId)?.code ?? "Route",
    routeName: routes.get(trip.routeId)?.name ?? "Unavailable",
    driverName: drivers.get(trip.driverId)?.name ?? "Unassigned",
    vehicleName: vehicles.get(trip.vehicleId)?.displayName ?? "Unassigned",
    bookedSeats: occupied.get(trip.id)?.length ?? 0,
    capacity: trip.capacity,
    status: trip.status,
  }));

  const tripsById = indexById(records.trips);
  let todaysBookings = 0;
  for (const trip of todayTrips) {
    todaysBookings += occupied.get(trip.id)?.length ?? 0;
  }

  const activeTrips = todayTrips.filter((trip) => isActiveTrip(trip.status)).length;
  const cancelledTrips = todayTrips.filter((trip) => trip.status === "cancelled").length;
  const openSeats = todayTrips.reduce((total, trip) => {
    if (!OPEN_TRIP_STATUSES.has(trip.status)) {
      return total;
    }
    const booked = occupied.get(trip.id)?.length ?? 0;
    return total + Math.max(0, trip.capacity - booked);
  }, 0);

  const occupiedCounts = new Map(
    [...occupied.entries()].map(([tripId, tripBookings]) => [tripId, tripBookings.length]),
  );
  const demand = hourlyDemand(todayTrips, occupiedCounts);
  const peaks = peakDemand(demand);
  const utilization = utilizationByRoute(todayTrips, occupiedCounts);

  const routeRows: RouteUtilizationRow[] = [...utilization.entries()]
    .map(([routeId, totals]) => {
      const route = routes.get(routeId);
      return {
        routeId,
        code: route?.code ?? "Route",
        name: route?.name ?? "Unavailable",
        bookings: totals.bookings,
        capacity: totals.capacity,
        utilizationLabel: formatUtilization(totals.bookings, totals.capacity),
      };
    })
    .sort((left, right) => left.code.localeCompare(right.code));

  const recentBookings: RecentBookingRow[] = records.bookings
    .slice()
    .sort((left, right) => {
      const byTime = right.bookedAt.localeCompare(left.bookedAt);
      return byTime === 0 ? right.id.localeCompare(left.id) : byTime;
    })
    .slice(0, RECENT_BOOKING_LIMIT)
    .map((booking) => {
      const trip = tripsById.get(booking.tripId);
      const route = trip ? routes.get(trip.routeId) : undefined;
      return {
        id: booking.id,
        passengerName: users.get(booking.userId)?.name ?? "Passenger",
        routeCode: route?.code ?? "Route",
        pickupName: stops.get(booking.pickupStopId)?.name ?? "Pickup",
        dropoffName: stops.get(booking.dropoffStopId)?.name ?? "Destination",
        departureTime: trip?.departureTime ?? "--:--",
        serviceDate: trip?.serviceDate ?? "",
        status: booking.status,
        bookedAt: booking.bookedAt,
      };
    });

  const alerts = buildAlerts(
    todayTrips,
    occupied,
    drivers,
    vehicles,
    routes,
    schedulesByDriver,
    driverStatus.available,
  );

  const operating = todayTrips.length - cancelledTrips;

  return {
    serviceDate,
    kpis: [
      {
        id: "trips",
        label: "Today's trips",
        value: todayTrips.length,
        context:
          cancelledTrips > 0
            ? `${operating} operating, ${cancelledTrips} cancelled`
            : "On today's timetable",
      },
      {
        id: "bookings",
        label: "Today's bookings",
        value: todaysBookings,
        context: "Excludes cancelled bookings",
      },
      {
        id: "active",
        label: "Active trips",
        value: activeTrips,
        context: "Boarding or in progress",
      },
      {
        id: "drivers",
        label: "Available drivers",
        value: driverStatus.available,
        context: "On duty, not on a trip or break",
      },
      {
        id: "seats",
        label: "Open seats",
        value: openSeats,
        context: "On trips still to finish",
      },
    ],
    trips: tripRows,
    recentBookings,
    driverStatus,
    demand,
    peaks,
    routes: routeRows,
    alerts,
  };
}
