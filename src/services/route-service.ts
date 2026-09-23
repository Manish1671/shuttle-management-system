import { validatePickupAndDropoff, validateRouteStops } from "@/lib/validation/domain";
import type { ValidationError } from "@/lib/validation/result";
import { notifyBookingsChanged } from "@/services/booking-sync";
import { RepositoryError } from "@/services/repository/collection";
import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";

import { bookingRepository, routeRepository, stopRepository, tripRepository } from "./repository";

export type RouteDraft = {
  id?: string;
  name: string;
  code: string;
  description: string;
  stopIds: string[];
  estimatedDurationMinutes: number;
  active: boolean;
};

export type RouteWriteResult =
  | { ok: true; route: Route }
  | { ok: false; errors: ValidationError[] };

function failure(code: string, message: string): RouteWriteResult {
  return { ok: false, errors: [{ code, message }] };
}

function slug(value: string): string {
  const next = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return next || "route";
}

function nextRouteId(code: string): string {
  const base = `route_${slug(code)}`;
  if (!routeRepository.getById(base)) {
    return base;
  }
  let index = 2;
  while (routeRepository.getById(`${base}_${index}`)) {
    index += 1;
  }
  return `${base}_${index}`;
}

function bookingOrderErrors(route: Route): ValidationError[] {
  const trips = new Map(
    tripRepository
      .getAll()
      .filter((trip) => trip.routeId === route.id)
      .map((trip) => [trip.id, trip]),
  );
  const errors: ValidationError[] = [];

  for (const booking of bookingRepository.getAll()) {
    const trip = trips.get(booking.tripId);
    if (!trip || trip.status === "cancelled" || trip.status === "completed" || booking.status === "cancelled") {
      continue;
    }
    const check = validatePickupAndDropoff(booking, route);
    if (!check.valid) {
      errors.push({
        code: check.errors[0]?.code ?? "ROUTE_STOP_ORDER",
        message: `This stop order would invalidate booking ${booking.id}. Pickup must stay before the destination.`,
      });
    }
  }

  return errors;
}

function persist(route: Route, creating: boolean): RouteWriteResult {
  try {
    const saved = creating
      ? routeRepository.create(route)
      : routeRepository.update(route.id, {
          name: route.name,
          code: route.code,
          description: route.description,
          stopIds: route.stopIds,
          estimatedDurationMinutes: route.estimatedDurationMinutes,
          active: route.active,
        });
    if (!saved) {
      return failure("REPOSITORY_FAILURE", "Unable to save this route. Please try again.");
    }
    notifyBookingsChanged();
    return { ok: true, route: saved };
  } catch (error) {
    if (error instanceof RepositoryError) {
      return failure("REPOSITORY_FAILURE", "Unable to save this route. Please try again.");
    }
    throw error;
  }
}

export const routeService = {
  getAll(): Route[] {
    return routeRepository.getAll();
  },
  getById(id: string): Route | null {
    return routeRepository.getById(id);
  },
  create(route: Route): Route {
    return routeRepository.create(route);
  },
  update(id: string, patch: Partial<Omit<Route, "id">>): Route | null {
    return routeRepository.update(id, patch);
  },
  delete(id: string): boolean {
    return routeRepository.delete(id);
  },
  /** Stops in route order. Missing stop ids are skipped. */
  getOrderedStops(routeId: string): Stop[] {
    const route = routeRepository.getById(routeId);
    if (!route) {
      return [];
    }

    return route.stopIds.flatMap((stopId) => {
      const stop = stopRepository.getById(stopId);
      return stop ? [stop] : [];
    });
  },

  saveRoute(draft: RouteDraft): RouteWriteResult {
    const name = draft.name.trim();
    const code = draft.code.trim();
    const description = draft.description.trim();
    if (!name) {
      return failure("ROUTE_NAME", "Enter a route name.");
    }
    if (!code) {
      return failure("ROUTE_CODE", "Enter a route code.");
    }
    if (!Number.isInteger(draft.estimatedDurationMinutes) || draft.estimatedDurationMinutes < 1) {
      return failure("ROUTE_DURATION", "Enter the estimated duration in whole minutes.");
    }

    const routes = routeRepository.getAll();
    const duplicateCode = routes.some(
      (route) => route.id !== draft.id && route.code.toLowerCase() === code.toLowerCase(),
    );
    if (duplicateCode) {
      return failure("DUPLICATE_CODE", "A route with this code already exists.");
    }

    const seen = new Set<string>();
    for (const stopId of draft.stopIds) {
      if (seen.has(stopId)) {
        return failure("ROUTE_STOP_ORDER", "A route cannot list the same stop twice.");
      }
      seen.add(stopId);
    }

    const id = draft.id ?? nextRouteId(code);
    if (!draft.id && routeRepository.getById(id)) {
      return failure("DUPLICATE_CODE", "A route with this identifier already exists.");
    }
    if (draft.id && !routeRepository.getById(draft.id)) {
      return failure("ROUTE_NOT_FOUND", "This route could not be found.");
    }

    const route: Route = {
      id,
      name,
      code,
      description,
      stopIds: [...draft.stopIds],
      estimatedDurationMinutes: draft.estimatedDurationMinutes,
      active: draft.active,
    };
    const structure = validateRouteStops(route, stopRepository.getAll());
    if (!structure.valid) {
      return { ok: false, errors: structure.errors };
    }

    const bookingErrors = bookingOrderErrors(route);
    if (bookingErrors.length > 0) {
      return { ok: false, errors: bookingErrors };
    }

    return persist(route, !draft.id);
  },

  setActive(id: string, active: boolean): RouteWriteResult {
    const route = routeRepository.getById(id);
    if (!route) {
      return failure("ROUTE_NOT_FOUND", "This route could not be found.");
    }
    return this.saveRoute({ ...route, active });
  },
};
