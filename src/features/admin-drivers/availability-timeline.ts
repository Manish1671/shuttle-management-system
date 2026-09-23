import { formatMinutes, parseTimeToMinutes } from "@/lib/time";
import type { DriverSchedule } from "@/types/schedule";
import type { Trip } from "@/types/trip";

import type { TimelineKind, TimelineModel, TimelineSegment } from "./driver-types";

const DAY_START = 5 * 60;
const DAY_END = 23 * 60;
const DEFAULT_START = 6 * 60;
const DEFAULT_END = 22 * 60;

export function visibleWindow(
  schedules: readonly DriverSchedule[],
  trips: readonly Trip[],
  date: string,
): { start: number; end: number } {
  const points: number[] = [];

  for (const schedule of schedules) {
    if (schedule.date !== date) {
      continue;
    }
    collect(points, schedule.dutyStart);
    collect(points, schedule.dutyEnd);
    for (const item of schedule.breaks) {
      collect(points, item.startTime);
      collect(points, item.endTime);
    }
  }

  for (const trip of trips) {
    if (trip.serviceDate !== date || trip.status === "cancelled") {
      continue;
    }
    collect(points, trip.departureTime);
    collect(points, trip.arrivalTime);
  }

  if (points.length === 0) {
    return { start: DEFAULT_START, end: DEFAULT_END };
  }

  const start = Math.max(DAY_START, Math.floor((Math.min(...points) - 60) / 60) * 60);
  const end = Math.min(DAY_END, Math.ceil((Math.max(...points) + 60) / 60) * 60);
  if (end - start < 4 * 60) {
    return { start: DEFAULT_START, end: DEFAULT_END };
  }

  return { start, end };
}

function collect(points: number[], value: string) {
  const minutes = parseTimeToMinutes(value);
  if (minutes !== null) {
    points.push(minutes);
  }
}

function hoursBetween(start: number, end: number): number[] {
  const hours: number[] = [];
  for (let minute = start; minute <= end; minute += 60) {
    hours.push(minute);
  }
  return hours;
}

function clamp(start: number, end: number, range: { start: number; end: number }): { start: number; end: number } | null {
  const nextStart = Math.max(start, range.start);
  const nextEnd = Math.min(end, range.end);
  if (nextEnd <= nextStart) {
    return null;
  }
  return { start: nextStart, end: nextEnd };
}

type Interval = { start: number; end: number };

function overlaps(start: number, end: number, interval: Interval): boolean {
  return start < interval.end && interval.start < end;
}

export function buildDriverTimeline(
  schedule: DriverSchedule | null,
  trips: readonly Trip[],
  range: { start: number; end: number },
  routeCode: (trip: Trip) => string,
): TimelineModel {
  const duty = schedule
    ? clamp(
        parseTimeToMinutes(schedule.dutyStart) ?? range.start,
        parseTimeToMinutes(schedule.dutyEnd) ?? range.start,
        range,
      )
    : null;
  const breaks = (schedule?.breaks ?? []).flatMap((item) => {
    const start = parseTimeToMinutes(item.startTime);
    const end = parseTimeToMinutes(item.endTime);
    if (start === null || end === null) {
      return [];
    }
    const next = clamp(start, end, range);
    return next
      ? [{ ...next, id: item.id, label: `${labelFor(item.reason)} ${item.startTime}–${item.endTime}` }]
      : [];
  });
  const tripIntervals = trips.flatMap((trip) => {
    if (trip.status === "cancelled") {
      return [];
    }
    const start = parseTimeToMinutes(trip.departureTime);
    const end = parseTimeToMinutes(trip.arrivalTime);
    if (start === null || end === null) {
      return [];
    }
    const next = clamp(start, end, range);
    if (!next) {
      return [];
    }
    const outside =
      !schedule ||
      start < (parseTimeToMinutes(schedule.dutyStart) ?? start) ||
      end > (parseTimeToMinutes(schedule.dutyEnd) ?? end);
    const duringBreak = breaks.some((item) => overlaps(start, end, item));
    return [
      {
        ...next,
        id: trip.id,
        label: `${routeCode(trip)} ${trip.departureTime}–${trip.arrivalTime}`,
        conflict: outside || duringBreak,
      },
    ];
  });

  const cuts = new Set<number>([range.start, range.end]);
  if (duty) {
    cuts.add(duty.start);
    cuts.add(duty.end);
  }
  for (const item of [...breaks, ...tripIntervals]) {
    cuts.add(item.start);
    cuts.add(item.end);
  }

  const points = [...cuts].sort((left, right) => left - right);
  const merged: TimelineSegment[] = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    if (start === undefined || end === undefined || end <= start) {
      continue;
    }
    const trip = tripIntervals.find((item) => overlaps(start, end, item));
    const onBreak = breaks.find((item) => overlaps(start, end, item));
    const insideDuty = duty ? start >= duty.start && end <= duty.end : false;
    let kind: TimelineKind = "off_duty";
    let conflict = false;
    if (trip) {
      kind = "on_trip";
      conflict = trip.conflict;
    } else if (insideDuty && onBreak) {
      kind = "on_break";
    } else if (insideDuty) {
      kind = "available";
    }
    const previous = merged[merged.length - 1];
    if (previous && previous.kind === kind && previous.conflict === conflict && previous.end === start) {
      previous.end = end;
      previous.label = labelForKind(kind, previous.start, end, conflict);
    } else {
      merged.push({
        id: `${kind}-${start}`,
        start,
        end,
        kind,
        label: labelForKind(kind, start, end, conflict),
        conflict,
      });
    }
  }

  const lanes = [
    {
      id: "duty",
      label: "Duty",
      empty: "No schedule for this date",
      segments: duty
        ? [
            {
              id: "duty",
              start: duty.start,
              end: duty.end,
              kind: "duty" as const,
              label: `Duty ${formatMinutes(duty.start)}–${formatMinutes(duty.end)}`,
              conflict: false,
            },
          ]
        : [],
    },
    {
      id: "available",
      label: "Available",
      empty: "No available window",
      segments: merged.filter((segment) => segment.kind === "available"),
    },
    {
      id: "trip",
      label: "Trip",
      empty: "No trips assigned",
      segments: tripIntervals.map((item) => ({
        id: item.id,
        start: item.start,
        end: item.end,
        kind: "on_trip" as const,
        label: item.conflict ? `${item.label}. Schedule conflict` : item.label,
        conflict: item.conflict,
      })),
    },
    {
      id: "break",
      label: "Break",
      empty: "No breaks scheduled",
      segments: breaks.map((item) => ({
        id: item.id,
        start: item.start,
        end: item.end,
        kind: "on_break" as const,
        label: item.label,
        conflict: false,
      })),
    },
  ];

  return {
    start: range.start,
    end: range.end,
    hours: hoursBetween(range.start, range.end),
    lanes,
    merged,
  };
}

function labelFor(reason: string): string {
  if (reason === "meal") return "Meal";
  if (reason === "rest") return "Rest";
  if (reason === "personal") return "Personal";
  return "Break";
}

function labelForKind(kind: TimelineKind, start: number, end: number, conflict: boolean): string {
  const span = `${formatMinutes(start)}–${formatMinutes(end)}`;
  const name =
    kind === "on_trip"
      ? "On trip"
      : kind === "on_break"
        ? "On break"
        : kind === "available"
          ? "Available"
          : kind === "duty"
            ? "Duty"
            : "Off duty";
  return conflict ? `${name} ${span}. Schedule conflict` : `${name} ${span}`;
}
