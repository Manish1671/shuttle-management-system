import type { Stop } from "@/types/stop";

import { stopRepository } from "./repository";

export const stopService = {
  getAll(): Stop[] {
    return stopRepository.getAll();
  },
  getById(id: string): Stop | null {
    return stopRepository.getById(id);
  },
  create(stop: Stop): Stop {
    return stopRepository.create(stop);
  },
  update(id: string, patch: Partial<Omit<Stop, "id">>): Stop | null {
    return stopRepository.update(id, patch);
  },
  delete(id: string): boolean {
    return stopRepository.delete(id);
  },
};
