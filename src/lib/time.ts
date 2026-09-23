/**
 * CampusRide stores calendar dates as YYYY-MM-DD and clock times as HH:mm
 * in 24-hour local time. A date-time stamp is YYYY-MM-DDTHH:mm.
 * No timezone suffix is used. The campus operates in a single local zone.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/;

export function isDateString(value: string): boolean {
  return DATE_PATTERN.test(value);
}

export function isTimeString(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function isDateTimeString(value: string): boolean {
  return DATE_TIME_PATTERN.test(value);
}

export function todayDateString(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateTimeStamp(now = new Date()): string {
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${todayDateString(now)}T${hours}:${minutes}`;
}

export function formatDisplayDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function hasDeparted(
  serviceDate: string,
  departureTime: string,
  now = new Date(),
): boolean {
  const [year, month, day] = serviceDate.split("-").map(Number);
  const [hours, minutes] = departureTime.split(":").map(Number);
  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return false;
  }

  return new Date(year, month - 1, day, hours, minutes).getTime() <= now.getTime();
}

/** Minutes from local midnight for a clock time already in memory. */
export function clockMinutes(now = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

/** HH:mm from minutes since midnight. Values outside 00:00–23:59 are clamped. */
export function formatMinutes(total: number): string {
  const bounded = Math.min(23 * 60 + 59, Math.max(0, Math.round(total)));
  const hours = Math.floor(bounded / 60);
  const minutes = bounded % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Returns minutes from midnight, or null when the value is not HH:mm. */
export function parseTimeToMinutes(value: string): number | null {
  if (!isTimeString(value)) {
    return null;
  }

  const [hours, minutes] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

/**
 * Two ranges overlap when each starts before the other ends.
 * A range that ends at the same minute the next one starts does not overlap.
 */
export function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA;
}
