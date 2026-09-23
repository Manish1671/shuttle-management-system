import type { DriverSchedule } from "@/types/schedule";

import { scheduleRepository } from "./repository";

export const scheduleService = {
  getAll(): DriverSchedule[] {
    return scheduleRepository.getAll();
  },
  getById(id: string): DriverSchedule | null {
    return scheduleRepository.getById(id);
  },
  create(schedule: DriverSchedule): DriverSchedule {
    return scheduleRepository.create(schedule);
  },
  update(
    id: string,
    patch: Partial<Omit<DriverSchedule, "id">>,
  ): DriverSchedule | null {
    return scheduleRepository.update(id, patch);
  },
  delete(id: string): boolean {
    return scheduleRepository.delete(id);
  },
};
