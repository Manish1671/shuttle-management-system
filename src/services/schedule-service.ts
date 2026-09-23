import { isDateString, isTimeString } from "@/lib/time";
import { validateDriverSchedule } from "@/lib/validation/domain";
import type { ValidationError } from "@/lib/validation/result";
import { notifyBookingsChanged } from "@/services/booking-sync";
import { RepositoryError } from "@/services/repository/collection";
import type { BreakReason, DriverBreak, DriverSchedule } from "@/types/schedule";

import { scheduleRepository } from "./repository";

export type ScheduleWriteResult =
  | { ok: true; schedule: DriverSchedule }
  | { ok: false; errors: ValidationError[] };

function clock(value: string): string {
  return value.length >= 5 ? value.slice(0, 5) : value;
}

function failure(code: string, message: string): ScheduleWriteResult {
  return { ok: false, errors: [{ code, message }] };
}

function nextBreakId(schedule: DriverSchedule): string {
  let index = schedule.breaks.length + 1;
  let id = `break_${schedule.id}_${index}`;
  while (schedule.breaks.some((item) => item.id === id)) {
    index += 1;
    id = `break_${schedule.id}_${index}`;
  }
  return id;
}

function persist(schedule: DriverSchedule): ScheduleWriteResult {
  const check = validateDriverSchedule(schedule);
  if (!check.valid) {
    return { ok: false, errors: check.errors };
  }

  try {
    const existing = scheduleRepository.getById(schedule.id);
    const saved = existing
      ? scheduleRepository.update(schedule.id, {
          driverId: schedule.driverId,
          date: schedule.date,
          dutyStart: schedule.dutyStart,
          dutyEnd: schedule.dutyEnd,
          breaks: schedule.breaks,
        })
      : scheduleRepository.create(schedule);

    if (!saved) {
      return failure("REPOSITORY_FAILURE", "Unable to save this schedule. Please try again.");
    }

    notifyBookingsChanged();
    return { ok: true, schedule: saved };
  } catch (error) {
    if (error instanceof RepositoryError) {
      return failure("REPOSITORY_FAILURE", "Unable to save this schedule. Please try again.");
    }
    throw error;
  }
}

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

  forDriverOnDate(driverId: string, date: string): DriverSchedule | null {
    return (
      scheduleRepository
        .getAll()
        .find((schedule) => schedule.driverId === driverId && schedule.date === date) ?? null
    );
  },

  saveDuty(
    driverId: string,
    date: string,
    dutyStart: string,
    dutyEnd: string,
  ): ScheduleWriteResult {
    dutyStart = clock(dutyStart);
    dutyEnd = clock(dutyEnd);
    if (!isDateString(date) || !isTimeString(dutyStart) || !isTimeString(dutyEnd)) {
      return failure("DUTY_TIME_INVALID", "Enter duty start and end as HH:mm.");
    }

    const existing = this.forDriverOnDate(driverId, date);
    const schedule: DriverSchedule = existing
      ? { ...existing, dutyStart, dutyEnd }
      : {
          id: `schedule_${driverId}_${date}`,
          driverId,
          date,
          dutyStart,
          dutyEnd,
          breaks: [],
        };

    return persist(schedule);
  },

  addBreak(
    driverId: string,
    date: string,
    startTime: string,
    endTime: string,
    reason: BreakReason,
  ): ScheduleWriteResult {
    const schedule = this.forDriverOnDate(driverId, date);
    if (!schedule) {
      return failure("SCHEDULE_NOT_FOUND", "Save a duty schedule before adding a break.");
    }
    startTime = clock(startTime);
    endTime = clock(endTime);
    if (!isTimeString(startTime) || !isTimeString(endTime)) {
      return failure("BREAK_OUTSIDE_DUTY", "Enter the break start and end as HH:mm.");
    }

    const next: DriverSchedule = {
      ...schedule,
      breaks: [
        ...schedule.breaks,
        {
          id: nextBreakId(schedule),
          driverScheduleId: schedule.id,
          startTime,
          endTime,
          reason,
        },
      ],
    };
    return persist(next);
  },

  updateBreak(
    driverId: string,
    date: string,
    breakId: string,
    patch: Pick<DriverBreak, "startTime" | "endTime" | "reason">,
  ): ScheduleWriteResult {
    const schedule = this.forDriverOnDate(driverId, date);
    if (!schedule) {
      return failure("SCHEDULE_NOT_FOUND", "This driver has no schedule on the selected date.");
    }
    if (!schedule.breaks.some((item) => item.id === breakId)) {
      return failure("BREAK_NOT_FOUND", "This break could not be found.");
    }
    const startTime = clock(patch.startTime);
    const endTime = clock(patch.endTime);
    if (!isTimeString(startTime) || !isTimeString(endTime)) {
      return failure("BREAK_OUTSIDE_DUTY", "Enter the break start and end as HH:mm.");
    }

    return persist({
      ...schedule,
      breaks: schedule.breaks.map((item) =>
        item.id === breakId
          ? {
              ...item,
              startTime,
              endTime,
              reason: patch.reason,
              driverScheduleId: schedule.id,
            }
          : item,
      ),
    });
  },

  removeBreak(driverId: string, date: string, breakId: string): ScheduleWriteResult {
    const schedule = this.forDriverOnDate(driverId, date);
    if (!schedule) {
      return failure("SCHEDULE_NOT_FOUND", "This driver has no schedule on the selected date.");
    }

    return persist({
      ...schedule,
      breaks: schedule.breaks.filter((item) => item.id !== breakId),
    });
  },
};
