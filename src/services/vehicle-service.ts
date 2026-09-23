import type { Vehicle } from "@/types/vehicle";

import { vehicleRepository } from "./repository";

export const vehicleService = {
  getAll(): Vehicle[] {
    return vehicleRepository.getAll();
  },
  getById(id: string): Vehicle | null {
    return vehicleRepository.getById(id);
  },
  create(vehicle: Vehicle): Vehicle {
    return vehicleRepository.create(vehicle);
  },
  update(id: string, patch: Partial<Omit<Vehicle, "id">>): Vehicle | null {
    return vehicleRepository.update(id, patch);
  },
  delete(id: string): boolean {
    return vehicleRepository.delete(id);
  },
};
