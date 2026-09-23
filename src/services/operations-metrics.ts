import { parseTimeToMinutes } from "@/lib/time";
import type { Trip, TripStatus } from "@/types/trip";

/** Share of seats filled before a trip is flagged as approaching capacity. */
export const CAPACITY_ATTENTION_RATIO = 0.8;

/** Display split below the capacity-attention ratio. Not a service target. */
export const MODERATE_OCCUPANCY_RATIO = 0.4;

export type HourlyDemandPoint = {
  hour: string;
  bookings: number;
};

export type OccupancyBand = "low" | "moderate" | "high" | "unknown";

/** A trip that still occupies the timetable. Cancelled trips are excluded. */
export function isOperatingTrip(status: TripStatus): boolean {
  return status !== "cancelled";
}

/** Boarding or in progress. Scheduled trips are not active. */
export function isActiveTrip(status: TripStatus): boolean {
  return status === "boarding" || status === "in_progress";
}

export function formatUtilization(booked: number, capacity: number): string {
  if (capacity <= 0) {
    return "—";
  }

  const percent = Math.round((booked / capacity) * 1000) / 10;
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(1)}%`;
}

export function occupancyBand(booked: number, capacity: number): OccupancyBand {
  if (capacity <= 0) {
    return "unknown";
  }

  const ratio = booked / capacity;
  if (ratio >= CAPACITY_ATTENTION_RATIO) {
    return "high";
  }
  if (ratio >= MODERATE_OCCUPANCY_RATIO) {
    return "moderate";
  }
  return "low";
}

/**
 * Non-cancelled bookings grouped by the departure hour.
 * Hours run from the earliest operating departure to the latest, including empty hours between them.
 */
export function hourlyDemand(
  trips: readonly Pick<Trip, "id" | "status" | "departureTime">[],
  occupiedByTrip: ReadonlyMap<string, number>,
): HourlyDemandPoint[] {
  const counts = new Map<string, number>();
  let minHour: number | null = null;
  let maxHour: number | null = null;

  for (const trip of trips) {
    if (!isOperatingTrip(trip.status)) {
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
    counts.set(label, (counts.get(label) ?? 0) + (occupiedByTrip.get(trip.id) ?? 0));
  }

  if (minHour === null || maxHour === null) {
    return [];
  }

  const points: HourlyDemandPoint[] = [];
  for (let hour = minHour; hour <= maxHour; hour += 1) {
    const label = `${String(hour).padStart(2, "0")}:00`;
    points.push({ hour: label, bookings: counts.get(label) ?? 0 });
  }
  return points;
}

/** Every hour tied for the highest non-zero booking count. */
export function peakDemand(demand: readonly HourlyDemandPoint[]): HourlyDemandPoint[] {
  const highest = demand.reduce((max, point) => Math.max(max, point.bookings), 0);
  if (highest === 0) {
    return [];
  }

  return demand.filter((point) => point.bookings === highest);
}

export function utilizationByRoute(
  trips: readonly Pick<Trip, "id" | "routeId" | "status" | "capacity">[],
  occupiedByTrip: ReadonlyMap<string, number>,
): Map<string, { bookings: number; capacity: number }> {
  const totals = new Map<string, { bookings: number; capacity: number }>();
  for (const trip of trips) {
    if (!isOperatingTrip(trip.status)) {
      continue;
    }

    const current = totals.get(trip.routeId) ?? { bookings: 0, capacity: 0 };
    current.bookings += occupiedByTrip.get(trip.id) ?? 0;
    current.capacity += trip.capacity;
    totals.set(trip.routeId, current);
  }
  return totals;
}
