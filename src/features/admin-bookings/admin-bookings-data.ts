import { todayDateString } from "@/lib/time";
import { bookingService } from "@/services/booking-service";
import { cancellationError, classifyBooking } from "@/services/booking-rules";
import type { BookingViewModel } from "@/services/booking-view";
import { driverService } from "@/services/driver-service";
import { routeService } from "@/services/route-service";
import { stopService } from "@/services/stop-service";
import { tripService } from "@/services/trip-service";
import { userService } from "@/services/user-service";
import { vehicleService } from "@/services/vehicle-service";
import type { Booking } from "@/types/booking";
import type { Driver } from "@/types/driver";
import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";
import type { Trip } from "@/types/trip";
import type { User } from "@/types/user";
import type { Vehicle } from "@/types/vehicle";

import type {
  AdminBookingFilters,
  AdminBookingMetrics,
  AdminBookingRow,
  AdminRouteOption,
} from "./admin-bookings-types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatBookingDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }

  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function indexById<T extends { id: string }>(records: readonly T[]): Map<string, T> {
  return new Map(records.map((record) => [record.id, record]));
}

function riderTypeLabel(user: User | undefined): string {
  if (user?.riderType === "student") {
    return "Student";
  }
  if (user?.riderType === "staff") {
    return "Staff";
  }
  return "Rider";
}

function compareRows(left: AdminBookingRow, right: AdminBookingRow): number {
  const leftKey = `${left.view.trip?.serviceDate ?? "0000-00-00"}T${left.view.trip?.departureTime ?? "00:00"}`;
  const rightKey = `${right.view.trip?.serviceDate ?? "0000-00-00"}T${right.view.trip?.departureTime ?? "00:00"}`;
  const byTrip = rightKey.localeCompare(leftKey);
  return byTrip === 0 ? right.view.booking.id.localeCompare(left.view.booking.id) : byTrip;
}

function toRow(
  booking: Booking,
  trips: Map<string, Trip>,
  routes: Map<string, Route>,
  drivers: Map<string, Driver>,
  vehicles: Map<string, Vehicle>,
  stops: Map<string, Stop>,
  users: Map<string, User>,
  now: Date,
): AdminBookingRow {
  const trip = trips.get(booking.tripId) ?? null;
  const route = trip ? routes.get(trip.routeId) ?? null : null;
  const passenger = users.get(booking.userId);
  const blocked = cancellationError(booking, trip, booking.userId, now);
  const view: BookingViewModel = {
    booking,
    trip,
    route,
    driver: trip ? drivers.get(trip.driverId) ?? null : null,
    vehicle: trip ? vehicles.get(trip.vehicleId) ?? null : null,
    pickupStop: stops.get(booking.pickupStopId) ?? null,
    dropoffStop: stops.get(booking.dropoffStopId) ?? null,
    passengerName: passenger?.name ?? "Rider",
    section: classifyBooking(booking, trip, now),
    canCancel: blocked === null,
  };

  return {
    view,
    riderId: passenger?.id ?? booking.userId,
    riderTypeLabel: riderTypeLabel(passenger),
    cancelBlockReason: blocked && blocked.code !== "ALREADY_CANCELLED" ? blocked.message : null,
  };
}

export function loadAdminBookings(now = new Date()): {
  rows: AdminBookingRow[];
  routes: AdminRouteOption[];
} {
  const trips = indexById(tripService.getAll());
  const routes = indexById(routeService.getAll());
  const drivers = indexById(driverService.getAll());
  const vehicles = indexById(vehicleService.getAll());
  const stops = indexById(stopService.getAll());
  const users = indexById(userService.getAll());

  const rows = bookingService
    .getAll()
    .map((booking) => toRow(booking, trips, routes, drivers, vehicles, stops, users, now))
    .sort(compareRows);

  const usedRouteIds = new Set(
    rows.flatMap((row) => (row.view.route ? [row.view.route.id] : [])),
  );
  const routeOptions = [...routes.values()]
    .filter((route) => usedRouteIds.has(route.id))
    .sort((left, right) => left.code.localeCompare(right.code))
    .map((route) => ({ id: route.id, label: `${route.code} · ${route.name}` }));

  return { rows, routes: routeOptions };
}

export function adminBookingMetrics(rows: readonly AdminBookingRow[], now = new Date()): AdminBookingMetrics {
  const today = todayDateString(now);
  let confirmed = 0;
  let cancelled = 0;
  let todayCount = 0;

  for (const row of rows) {
    if (row.view.booking.status === "confirmed") {
      confirmed += 1;
    }
    if (row.view.booking.status === "cancelled") {
      cancelled += 1;
    }
    if (row.view.trip?.serviceDate === today && row.view.booking.status !== "cancelled") {
      todayCount += 1;
    }
  }

  return {
    total: rows.length,
    confirmed,
    cancelled,
    today: todayCount,
  };
}

function matchesDate(row: AdminBookingRow, date: AdminBookingFilters["date"], today: string): boolean {
  const serviceDate = row.view.trip?.serviceDate;
  if (date === "all") {
    return true;
  }
  if (!serviceDate) {
    return date === "past";
  }
  if (date === "today") {
    return serviceDate === today;
  }
  if (date === "upcoming") {
    return serviceDate > today;
  }

  return serviceDate < today;
}

function matchesQuery(row: AdminBookingRow, query: string): boolean {
  if (!query) {
    return true;
  }

  const { view } = row;
  const haystack = [
    view.booking.id,
    view.passengerName,
    row.riderId,
    view.route?.name ?? "",
    view.route?.code ?? "",
    view.trip?.id ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function filterAdminBookings(
  rows: readonly AdminBookingRow[],
  filters: AdminBookingFilters,
  now = new Date(),
): AdminBookingRow[] {
  const query = filters.query.trim().toLowerCase();
  const today = todayDateString(now);

  return rows.filter((row) => {
    if (filters.status === "confirmed" && row.view.booking.status !== "confirmed") {
      return false;
    }
    if (filters.status === "cancelled" && row.view.booking.status !== "cancelled") {
      return false;
    }
    if (filters.routeId !== "all" && row.view.route?.id !== filters.routeId) {
      return false;
    }
    if (!matchesDate(row, filters.date, today)) {
      return false;
    }
    return matchesQuery(row, query);
  });
}
