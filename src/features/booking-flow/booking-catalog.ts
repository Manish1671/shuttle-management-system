import { todayDateString } from "@/lib/time";
import { routeService } from "@/services/route-service";
import { tripService } from "@/services/trip-service";
import type { Route } from "@/types/route";

export type BookingCatalog = {
  ready: boolean;
  dates: string[];
  routes: Route[];
};

const emptyCatalog: BookingCatalog = {
  ready: false,
  dates: [],
  routes: [],
};

let catalog: BookingCatalog | null = null;

export function subscribeBookingCatalog(): () => void {
  return () => {};
}

export function getBookingCatalog(): BookingCatalog {
  if (!catalog) {
    const today = todayDateString();
    const dates = [
      ...new Set(tripService.getAll().map((trip) => trip.serviceDate)),
    ]
      .filter((date) => date >= today)
      .sort();
    const routes = routeService
      .getAll()
      .filter((route) => route.active)
      .sort((left, right) => left.code.localeCompare(right.code));

    catalog = { ready: true, dates, routes };
  }

  return catalog;
}

export function getServerBookingCatalog(): BookingCatalog {
  return emptyCatalog;
}
