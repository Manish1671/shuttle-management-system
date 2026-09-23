import type { Driver } from "@/types/driver";

import { driverRepository } from "./repository";

export const driverService = {
  getAll(): Driver[] {
    return driverRepository.getAll();
  },
  getById(id: string): Driver | null {
    return driverRepository.getById(id);
  },
  create(driver: Driver): Driver {
    return driverRepository.create(driver);
  },
  update(id: string, patch: Partial<Omit<Driver, "id">>): Driver | null {
    return driverRepository.update(id, patch);
  },
  delete(id: string): boolean {
    return driverRepository.delete(id);
  },
};
