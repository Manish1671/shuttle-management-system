import { addCalendarDays, formatShortDate, parseTimeToMinutes, todayDateString } from "@/lib/time";
import {
  formatUtilization,
  hourlyDemand,
  isActiveTrip,
  isOperatingTrip,
  occupancyBand,
  peakDemand,
  utilizationByRoute,
  type HourlyDemandPoint,
  type OccupancyBand,
} from "@/services/operations-metrics";
import { occupiesSeat } from "@/lib/validation/domain";
import type { Booking } from "@/types/booking";
import type { Driver } from "@/types/driver";
import type { Route } from "@/types/route";
import type { Trip, TripStatus } from "@/types/trip";
import type { Vehicle } from "@/types/vehicle";

import type { AnalyticsFilters, AnalyticsPreset } from "./analytics-types";

export type AnalyticsRecords = {
  trips: readonly Trip[];
  bookings: readonly Booking[];
  routes: readonly Route[];
  drivers: readonly Driver[];
  vehicles: readonly Vehicle[];
};

export type AnalyticsDatePoint = {
  date: string;
  label: string;
  bookings: number;
};

export type AnalyticsRouteRow = {
  routeId: string;
  code: string;
  name: string;
  trips: number;
  bookings: number;
  capacity: number;
  utilizationLabel: string;
};

export type OccupancyRow = {
  id: string;
  routeName: string;
  routeCode: string;
  serviceDate: string;
  departureTime: string;
  booked: number;
  capacity: number;
  utilizationLabel: string;
  band: OccupancyBand;
};

export type StatusCount = {
  status: TripStatus;
  label: string;
  count: number;
};

export type DriverUsageRow = {
  id: string;
  name: string;
  employeeId: string;
  trips: number;
  operating: number;
  completed: number;
  minutes: number;
};

export type VehicleUsageRow = {
  id: string;
  registrationNumber: string;
  displayName: string;
  trips: number;
  occupied: number;
  capacity: number;
  utilizationLabel: string;
};

export type CancellationRouteRow = {
  routeId: string;
  code: string;
  name: string;
  cancelled: number;
  total: number;
  rateLabel: string;
};

export type AnalyticsModel = {
  invalidRange: boolean;
  empty: boolean;
  tripCount: number;
  operatingTrips: number;
  activeTrips: number;
  completedTrips: number;
  demandBookings: number;
  totalBookings: number;
  cancelledBookings: number;
  cancellationLabel: string;
  occupancyLabel: string;
  availableSeats: number;
  hourly: HourlyDemandPoint[];
  peaks: HourlyDemandPoint[];
  peakLabel: string;
  byDate: AnalyticsDatePoint[];
  routes: AnalyticsRouteRow[];
  occupancy: OccupancyRow[];
  statuses: StatusCount[];
  drivers: DriverUsageRow[];
  vehicles: VehicleUsageRow[];
  cancellations: CancellationRouteRow[];
};

const STATUS_LABEL: Record<TripStatus, string> = {
  scheduled: "Scheduled",
  boarding: "Boarding",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_ORDER: TripStatus[] = ["scheduled", "boarding", "in_progress", "completed", "cancelled"];

const EMPTY_MODEL: AnalyticsModel = {
  invalidRange: false,
  empty: true,
  tripCount: 0,
  operatingTrips: 0,
  activeTrips: 0,
  completedTrips: 0,
  demandBookings: 0,
  totalBookings: 0,
  cancelledBookings: 0,
  cancellationLabel: "—",
  occupancyLabel: "—",
  availableSeats: 0,
  hourly: [],
  peaks: [],
  peakLabel: "—",
  byDate: [],
  routes: [],
  occupancy: [],
  statuses: STATUS_ORDER.map((status) => ({ status, label: STATUS_LABEL[status], count: 0 })),
  drivers: [],
  vehicles: [],
  cancellations: [],
};

function indexById<T extends { id: string }>(records: readonly T[]): Map<string, T> {
  return new Map(records.map((record) => [record.id, record]));
}

export function datasetBounds(trips: readonly Pick<Trip, "serviceDate">[]): { start: string; end: string } | null {
  let start: string | null = null;
  let end: string | null = null;
  for (const trip of trips) {
    if (!start || trip.serviceDate < start) {
      start = trip.serviceDate;
    }
    if (!end || trip.serviceDate > end) {
      end = trip.serviceDate;
    }
  }
  return start && end ? { start, end } : null;
}

export function rangeForPreset(
  preset: AnalyticsPreset,
  today: string,
  bounds: { start: string; end: string } | null,
): { start: string; end: string } {
  if (preset === "7") {
    return { start: addCalendarDays(today, -6), end: today };
  }
  if (preset === "30") {
    return { start: addCalendarDays(today, -29), end: today };
  }
  if (preset === "all" && bounds) {
    return bounds;
  }
  return { start: today, end: today };
}

function eachDate(start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end && dates.length < 400) {
    dates.push(cursor);
    cursor = addCalendarDays(cursor, 1);
  }
  return dates;
}

function tripMinutes(trip: Pick<Trip, "departureTime" | "arrivalTime">): number {
  const start = parseTimeToMinutes(trip.departureTime);
  const end = parseTimeToMinutes(trip.arrivalTime);
  if (start === null || end === null || end <= start) {
    return 0;
  }
  return end - start;
}

export function buildAnalytics(
  records: AnalyticsRecords,
  filters: Pick<AnalyticsFilters, "start" | "end" | "routeId">,
): AnalyticsModel {
  if (filters.start > filters.end) {
    return { ...EMPTY_MODEL, invalidRange: true };
  }

  const routes = indexById(records.routes);
  const trips = records.trips.filter((trip) => {
    if (trip.serviceDate < filters.start || trip.serviceDate > filters.end) {
      return false;
    }
    return filters.routeId === "all" || trip.routeId === filters.routeId;
  });
  const tripsById = indexById(trips);
  const tripIds = new Set(trips.map((trip) => trip.id));
  const periodBookings = records.bookings.filter((booking) => tripIds.has(booking.tripId));
  const occupiedByTrip = new Map<string, number>();
  let totalBookings = 0;
  let cancelledBookings = 0;
  let demandBookings = 0;

  for (const booking of periodBookings) {
    totalBookings += 1;
    if (!occupiesSeat(booking)) {
      cancelledBookings += 1;
      continue;
    }
    demandBookings += 1;
    occupiedByTrip.set(booking.tripId, (occupiedByTrip.get(booking.tripId) ?? 0) + 1);
  }

  const statusCounts = new Map<TripStatus, number>(STATUS_ORDER.map((status) => [status, 0]));
  let operatingTrips = 0;
  let activeTrips = 0;
  let completedTrips = 0;
  let occupiedSeats = 0;
  let operatingCapacity = 0;
  let availableSeats = 0;
  const tripsByRoute = new Map<string, number>();
  const driverUsage = new Map<string, DriverUsageRow>();
  const vehicleUsage = new Map<string, VehicleUsageRow>();

  for (const driver of records.drivers) {
    driverUsage.set(driver.id, {
      id: driver.id,
      name: driver.name,
      employeeId: driver.employeeId,
      trips: 0,
      operating: 0,
      completed: 0,
      minutes: 0,
    });
  }
  for (const vehicle of records.vehicles) {
    vehicleUsage.set(vehicle.id, {
      id: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      displayName: vehicle.displayName,
      trips: 0,
      occupied: 0,
      capacity: 0,
      utilizationLabel: "—",
    });
  }

  for (const trip of trips) {
    statusCounts.set(trip.status, (statusCounts.get(trip.status) ?? 0) + 1);
    tripsByRoute.set(trip.routeId, (tripsByRoute.get(trip.routeId) ?? 0) + 1);
    const driverRow = driverUsage.get(trip.driverId);
    if (driverRow) {
      driverRow.trips += 1;
    }
    const vehicleRow = vehicleUsage.get(trip.vehicleId);
    if (vehicleRow) {
      vehicleRow.trips += 1;
    }
    if (trip.status === "completed") {
      completedTrips += 1;
      if (driverRow) {
        driverRow.completed += 1;
      }
    }
    if (!isOperatingTrip(trip.status)) {
      continue;
    }
    operatingTrips += 1;
    if (isActiveTrip(trip.status)) {
      activeTrips += 1;
    }
    const booked = occupiedByTrip.get(trip.id) ?? 0;
    occupiedSeats += booked;
    operatingCapacity += trip.capacity;
    availableSeats += Math.max(0, trip.capacity - booked);
    if (driverRow) {
      driverRow.operating += 1;
      driverRow.minutes += tripMinutes(trip);
    }
    if (vehicleRow) {
      vehicleRow.occupied += booked;
      vehicleRow.capacity += trip.capacity;
    }
  }

  for (const row of vehicleUsage.values()) {
    row.utilizationLabel = formatUtilization(row.occupied, row.capacity);
  }

  const routeTotals = utilizationByRoute(trips, occupiedByTrip);
  const routeRows: AnalyticsRouteRow[] = [...tripsByRoute.entries()]
    .map(([routeId, tripCount]) => {
      const route = routes.get(routeId);
      const totals = routeTotals.get(routeId) ?? { bookings: 0, capacity: 0 };
      return {
        routeId,
        code: route?.code ?? "Route",
        name: route?.name ?? "Unavailable",
        trips: tripCount,
        bookings: totals.bookings,
        capacity: totals.capacity,
        utilizationLabel: formatUtilization(totals.bookings, totals.capacity),
      };
    })
    .sort((left, right) => left.code.localeCompare(right.code));

  const cancelledByRoute = new Map<string, { cancelled: number; total: number }>();
  for (const booking of periodBookings) {
    const trip = tripsById.get(booking.tripId);
    if (!trip) {
      continue;
    }
    const current = cancelledByRoute.get(trip.routeId) ?? { cancelled: 0, total: 0 };
    current.total += 1;
    if (!occupiesSeat(booking)) {
      current.cancelled += 1;
    }
    cancelledByRoute.set(trip.routeId, current);
  }

  const demandByDate = new Map<string, number>();
  for (const trip of trips) {
    if (!isOperatingTrip(trip.status)) {
      continue;
    }
    demandByDate.set(trip.serviceDate, (demandByDate.get(trip.serviceDate) ?? 0) + (occupiedByTrip.get(trip.id) ?? 0));
  }
  const byDate = eachDate(filters.start, filters.end).map((date) => ({
    date,
    label: formatShortDate(date),
    bookings: demandByDate.get(date) ?? 0,
  }));

  const hourly = hourlyDemand(trips, occupiedByTrip);
  const peaks = peakDemand(hourly);
  const occupancy = trips
    .filter((trip) => isOperatingTrip(trip.status))
    .slice()
    .sort((left, right) => {
      const date = left.serviceDate.localeCompare(right.serviceDate);
      return date === 0 ? left.departureTime.localeCompare(right.departureTime) : date;
    })
    .map((trip) => {
      const booked = occupiedByTrip.get(trip.id) ?? 0;
      const route = routes.get(trip.routeId);
      return {
        id: trip.id,
        routeName: route?.name ?? "Unavailable",
        routeCode: route?.code ?? "Route",
        serviceDate: trip.serviceDate,
        departureTime: trip.departureTime,
        booked,
        capacity: trip.capacity,
        utilizationLabel: formatUtilization(booked, trip.capacity),
        band: occupancyBand(booked, trip.capacity),
      };
    });

  return {
    invalidRange: false,
    empty: trips.length === 0,
    tripCount: trips.length,
    operatingTrips,
    activeTrips,
    completedTrips,
    demandBookings,
    totalBookings,
    cancelledBookings,
    cancellationLabel: formatUtilization(cancelledBookings, totalBookings),
    occupancyLabel: formatUtilization(occupiedSeats, operatingCapacity),
    availableSeats,
    hourly,
    peaks,
    peakLabel: peaks.length === 0 ? "—" : peaks.map((peak) => peak.hour).join(" and "),
    byDate,
    routes: routeRows,
    occupancy,
    statuses: STATUS_ORDER.map((status) => ({
      status,
      label: STATUS_LABEL[status],
      count: statusCounts.get(status) ?? 0,
    })),
    drivers: [...driverUsage.values()].sort((left, right) => left.name.localeCompare(right.name)),
    vehicles: [...vehicleUsage.values()].sort((left, right) =>
      left.registrationNumber.localeCompare(right.registrationNumber),
    ),
    cancellations: [...cancelledByRoute.entries()]
      .map(([routeId, totals]) => {
        const route = routes.get(routeId);
        return {
          routeId,
          code: route?.code ?? "Route",
          name: route?.name ?? "Unavailable",
          cancelled: totals.cancelled,
          total: totals.total,
          rateLabel: formatUtilization(totals.cancelled, totals.total),
        };
      })
      .sort((left, right) => left.code.localeCompare(right.code)),
  };
}

export function initialFilters(trips: readonly Pick<Trip, "serviceDate">[], now = new Date()): AnalyticsFilters {
  const today = todayDateString(now);
  const range = rangeForPreset("today", today, datasetBounds(trips));
  return { preset: "today", ...range, routeId: "all" };
}
