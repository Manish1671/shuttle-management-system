import { todayDateString } from "@/lib/time";
import { getBookingRevision, subscribeBookingChanges } from "@/services/booking-sync";
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
let catalogRevision = -1;

export function subscribeBookingCatalog(listener: () => void): () => void {
  return subscribeBookingChanges(() => {
    catalog = null;
    listener();
  });
}

export function getBookingCatalog(): BookingCatalog {
  const revision = getBookingRevision();
  if (catalog && catalogRevision === revision) {
    return catalog;
  }

  const today = todayDateString();
  const dates = [...new Set(tripService.getAll().map((trip) => trip.serviceDate))]
    .filter((date) => date >= today)
    .sort();
  const routes = routeService
    .getAll()
    .filter((route) => route.active)
    .sort((left, right) => left.code.localeCompare(right.code));

  catalogRevision = revision;
  catalog = { ready: true, dates, routes };
  return catalog;
}

export function getServerBookingCatalog(): BookingCatalog {
  return emptyCatalog;
}
