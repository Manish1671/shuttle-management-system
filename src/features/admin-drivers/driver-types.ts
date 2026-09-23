import type { Driver, DriverStatus } from "@/types/driver";
import type { DriverSchedule } from "@/types/schedule";
import type { Trip } from "@/types/trip";
import type { ValidationError } from "@/lib/validation/result";

export type DriverStatusFilter = "all" | DriverStatus;

export type DriverFilters = {
  query: string;
  status: DriverStatusFilter;
};

export const defaultDriverFilters: DriverFilters = {
  query: "",
  status: "all",
};

export type TimelineKind = "off_duty" | "duty" | "available" | "on_break" | "on_trip";

export type TimelineSegment = {
  id: string;
  start: number;
  end: number;
  kind: TimelineKind;
  label: string;
  conflict: boolean;
};

export type TimelineLane = {
  id: string;
  label: string;
  segments: TimelineSegment[];
  empty: string;
};

export type TimelineModel = {
  start: number;
  end: number;
  hours: number[];
  lanes: TimelineLane[];
  merged: TimelineSegment[];
};

export type DriverTripView = {
  trip: Trip;
  routeCode: string;
  routeName: string;
  vehicleName: string;
};

export type DriverDayView = {
  driver: Driver;
  schedule: DriverSchedule | null;
  trips: DriverTripView[];
  status: DriverStatus;
  conflicts: ValidationError[];
  timeline: TimelineModel;
};

export type DriverDayMetrics = {
  total: number;
  available: number;
  onTrip: number;
  onBreak: number;
  offDuty: number;
};
