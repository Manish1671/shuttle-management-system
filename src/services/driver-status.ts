import { clockMinutes, parseTimeToMinutes } from "@/lib/time";
import type { DriverStatus } from "@/types/driver";
import type { DriverSchedule } from "@/types/schedule";
import type { Trip, TripStatus } from "@/types/trip";

const ACTIVE_TRIP_STATUSES = new Set<TripStatus>(["boarding", "in_progress"]);

/**
 * Point-in-time status for a service date.
 * A boarding or in-progress trip wins.
 * Otherwise the duty schedule and the clock decide.
 * The stored Driver.status field is not used.
 */
export function deriveDriverStatus(
  driverId: string,
  dayTrips: readonly Trip[],
  schedule: DriverSchedule | undefined,
  now = new Date(),
): DriverStatus {
  const onTrip = dayTrips.some(
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
