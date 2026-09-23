import type { TripStatus } from "@/types/trip";

export type TripDateFilter = "today" | "upcoming" | "past" | "all";

export type TripStatusFilter = "all" | TripStatus;

export type TripFilters = {
  query: string;
  date: TripDateFilter;
  status: TripStatusFilter;
  routeId: string;
  driverId: string;
  vehicleId: string;
};

export const defaultTripFilters: TripFilters = {
  query: "",
  date: "today",
  status: "all",
  routeId: "all",
  driverId: "all",
  vehicleId: "all",
};

export type TripMetrics = {
  today: number;
  scheduled: number;
  active: number;
  completed: number;
  cancelled: number;
};

export type AssignmentState = "Available" | "On trip" | "On break" | "Off duty" | "Conflict";

export type AssignmentOption = {
  id: string;
  title: string;
  state: AssignmentState;
  duty: string;
  detail: string;
  selectable: boolean;
};
