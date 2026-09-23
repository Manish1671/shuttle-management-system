import type { Trip } from "@/types/trip";

import { tripRepository } from "./repository";

export const tripService = {
  getAll(): Trip[] {
    return tripRepository.getAll();
  },
  getById(id: string): Trip | null {
    return tripRepository.getById(id);
  },
  create(trip: Trip): Trip {
    return tripRepository.create(trip);
  },
  update(id: string, patch: Partial<Omit<Trip, "id">>): Trip | null {
    return tripRepository.update(id, patch);
  },
  delete(id: string): boolean {
    return tripRepository.delete(id);
  },
};
