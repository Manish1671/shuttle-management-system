import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";

import { routeRepository, stopRepository } from "./repository";

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
};
