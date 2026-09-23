import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";

export type RouteActivityFilter = "all" | "active" | "inactive";

export type RouteFilters = {
  query: string;
  activity: RouteActivityFilter;
};

export const defaultRouteFilters: RouteFilters = {
  query: "",
  activity: "all",
};

export type RouteViewModel = {
  route: Route;
  stops: Stop[];
  todayTrips: number;
  upcomingTrips: number;
  todayBookings: number;
  utilizationLabel: string;
};

export type RouteMetrics = {
  totalRoutes: number;
  activeRoutes: number;
  inactiveRoutes: number;
  totalStops: number;
};
