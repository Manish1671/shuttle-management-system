import { clockMinutes, parseTimeToMinutes, todayDateString } from "@/lib/time";
import { occupiesSeat } from "@/lib/validation/domain";
import type { Booking } from "@/types/booking";
import type { Driver, DriverStatus } from "@/types/driver";
import type { DriverSchedule } from "@/types/schedule";
import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";
import type { Trip, TripStatus } from "@/types/trip";
import type { User } from "@/types/user";
import type { Vehicle } from "@/types/vehicle";

import type {
  AdminDashboard,
  DashboardAlert,
  DemandPoint,
  DriverStatusCounts,
  PeakDemand,
  RecentBookingRow,
  RouteUtilizationRow,
  TodayTripRow,
} from "./dashboard-types";

/** Share of seats filled before a trip is flagged as approaching capacity. */
export const CAPACITY_ATTENTION_RATIO = 0.8;

const ACTIVE_TRIP_STATUSES = new Set<TripStatus>(["boarding", "in_progress"]);
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

export function formatUtilization(bookings: number, capacity: number): string {
  if (capacity <= 0) {
    return "0%";
  }

  const percent = Math.round((bookings / capacity) * 1000) / 10;
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(1)}%`;
}

/**
 * Operational status for the dashboard.
 * An active trip (boarding or in progress) wins.
 * Otherwise the duty schedule and the clock decide.
 * The stored Driver.status field is not used.
 */
export function deriveDriverStatus(
  driverId: string,
  todayTrips: readonly Trip[],
  schedule: DriverSchedule | undefined,
  now: Date,
): DriverStatus {
  const onTrip = todayTrips.some(
    (trip) => trip.driverId === driverId && ACTIVE_TRIP_STATUSES.has(trip.status),
  );
  if (onTrip) {
    return "on_trip";
  }

  if (!schedule) {
    return "off_duty";
  }

  const nowMinutes = clockMinutes(now);
  const dutyStart = parseTimeToMinutes(schedule.dutyStart);
  const dutyEnd = parseTimeToMinutes(schedule.dutyEnd);
  if (dutyStart === null || dutyEnd === null || nowMinutes < dutyStart || nowMinutes >= dutyEnd) {
    return "off_duty";
  }

  const onBreak = schedule.breaks.some((item) => {
    const start = parseTimeToMinutes(item.startTime);
    const end = parseTimeToMinutes(item.endTime);
    return start !== null && end !== null && nowMinutes >= start && nowMinutes < end;
  });

  return onBreak ? "on_break" : "available";
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

function buildDemand(todayTrips: readonly Trip[], occupied: Map<string, Booking[]>): DemandPoint[] {
  const counts = new Map<string, number>();
  let minHour: number | null = null;
  let maxHour: number | null = null;

  for (const trip of todayTrips) {
    if (trip.status === "cancelled") {
      continue;
    }

    const minutes = parseTimeToMinutes(trip.departureTime);
    if (minutes === null) {
      continue;
    }

    const hour = Math.floor(minutes / 60);
    minHour = minHour === null ? hour : Math.min(minHour, hour);
    maxHour = maxHour === null ? hour : Math.max(maxHour, hour);
    const label = `${String(hour).padStart(2, "0")}:00`;
    const seats = occupied.get(trip.id)?.length ?? 0;
    counts.set(label, (counts.get(label) ?? 0) + seats);
  }

  if (minHour === null || maxHour === null) {
    return [];
  }

  const points: DemandPoint[] = [];
  for (let hour = minHour; hour <= maxHour; hour += 1) {
    const label = `${String(hour).padStart(2, "0")}:00`;
    points.push({ hour: label, bookings: counts.get(label) ?? 0 });
  }
  return points;
}

function peakHours(demand: readonly DemandPoint[]): PeakDemand[] {
  const highest = demand.reduce((max, point) => Math.max(max, point.bookings), 0);
  if (highest === 0) {
    return [];
  }

  return demand
    .filter((point) => point.bookings === highest)
    .map((point) => ({ hour: point.hour, bookings: point.bookings }));
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

  const activeTrips = todayTrips.filter((trip) => ACTIVE_TRIP_STATUSES.has(trip.status)).length;
  const cancelledTrips = todayTrips.filter((trip) => trip.status === "cancelled").length;
  const openSeats = todayTrips.reduce((total, trip) => {
    if (!OPEN_TRIP_STATUSES.has(trip.status)) {
      return total;
    }
    const booked = occupied.get(trip.id)?.length ?? 0;
    return total + Math.max(0, trip.capacity - booked);
  }, 0);

  const demand = buildDemand(todayTrips, occupied);
  const peaks = peakHours(demand);

  const utilization = new Map<string, { bookings: number; capacity: number }>();
  for (const trip of todayTrips) {
    if (trip.status === "cancelled") {
      continue;
    }
    const current = utilization.get(trip.routeId) ?? { bookings: 0, capacity: 0 };
    current.bookings += occupied.get(trip.id)?.length ?? 0;
    current.capacity += trip.capacity;
    utilization.set(trip.routeId, current);
  }

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
