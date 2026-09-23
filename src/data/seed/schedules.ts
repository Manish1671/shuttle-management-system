import type { BreakReason, DriverBreak, DriverSchedule } from "@/types/schedule";

type BreakSeed = {
  id: string;
  startTime: string;
  endTime: string;
  reason: BreakReason;
};

function schedule(
  id: string,
  driverId: string,
  date: string,
  dutyStart: string,
  dutyEnd: string,
  breaks: BreakSeed[],
): DriverSchedule {
  const driverBreaks: DriverBreak[] = breaks.map((item) => ({
    ...item,
    driverScheduleId: id,
  }));

  return {
    id,
    driverId,
    date,
    dutyStart,
    dutyEnd,
    breaks: driverBreaks,
  };
}

export const driverSchedules: DriverSchedule[] = [
  schedule("schedule_rahul_22", "driver_rahul", "2026-09-22", "07:00", "16:00", [
    { id: "break_rahul_22_meal", startTime: "12:00", endTime: "12:30", reason: "meal" },
    { id: "break_rahul_22_rest", startTime: "15:00", endTime: "15:15", reason: "rest" },
  ]),
  schedule("schedule_rahul_23", "driver_rahul", "2026-09-23", "07:00", "16:00", [
    { id: "break_rahul_23_meal", startTime: "12:30", endTime: "13:00", reason: "meal" },
    { id: "break_rahul_23_rest", startTime: "15:00", endTime: "15:20", reason: "rest" },
  ]),
  schedule("schedule_rahul_24", "driver_rahul", "2026-09-24", "07:00", "16:00", [
    { id: "break_rahul_24_meal", startTime: "12:00", endTime: "12:30", reason: "meal" },
  ]),

  schedule("schedule_neha_22", "driver_neha", "2026-09-22", "07:00", "15:00", [
    { id: "break_neha_22_meal", startTime: "12:00", endTime: "12:30", reason: "meal" },
  ]),
  schedule("schedule_neha_23", "driver_neha", "2026-09-23", "07:00", "17:00", [
    { id: "break_neha_23_meal", startTime: "12:00", endTime: "12:30", reason: "meal" },
  ]),
  schedule("schedule_neha_24", "driver_neha", "2026-09-24", "07:00", "15:00", [
    { id: "break_neha_24_meal", startTime: "12:00", endTime: "12:30", reason: "meal" },
  ]),

  schedule("schedule_meera_22", "driver_meera", "2026-09-22", "07:00", "16:00", [
    { id: "break_meera_22_meal", startTime: "12:30", endTime: "13:00", reason: "meal" },
  ]),
  schedule("schedule_meera_23", "driver_meera", "2026-09-23", "07:00", "18:00", [
    { id: "break_meera_23_meal", startTime: "13:00", endTime: "13:30", reason: "meal" },
  ]),
  schedule("schedule_meera_24", "driver_meera", "2026-09-24", "07:00", "16:00", [
    { id: "break_meera_24_meal", startTime: "12:30", endTime: "13:00", reason: "meal" },
  ]),

  schedule("schedule_vikram_22", "driver_vikram", "2026-09-22", "07:00", "16:00", [
    { id: "break_vikram_22_meal", startTime: "12:00", endTime: "12:30", reason: "meal" },
  ]),
  schedule("schedule_vikram_23", "driver_vikram", "2026-09-23", "07:00", "16:00", [
    { id: "break_vikram_23_meal", startTime: "12:00", endTime: "12:30", reason: "meal" },
  ]),
  schedule("schedule_vikram_24", "driver_vikram", "2026-09-24", "07:00", "16:00", [
    { id: "break_vikram_24_meal", startTime: "12:00", endTime: "12:30", reason: "meal" },
  ]),

  schedule("schedule_sara_22", "driver_sara", "2026-09-22", "09:30", "18:00", [
    { id: "break_sara_22_meal", startTime: "13:00", endTime: "13:30", reason: "meal" },
  ]),
  schedule("schedule_sara_23", "driver_sara", "2026-09-23", "09:30", "18:00", [
    { id: "break_sara_23_meal", startTime: "13:00", endTime: "13:30", reason: "meal" },
  ]),
  schedule("schedule_sara_24", "driver_sara", "2026-09-24", "09:30", "18:00", [
    { id: "break_sara_24_meal", startTime: "13:00", endTime: "13:30", reason: "meal" },
  ]),

  schedule("schedule_dev_22", "driver_dev", "2026-09-22", "09:30", "18:00", [
    { id: "break_dev_22_meal", startTime: "16:00", endTime: "16:30", reason: "meal" },
  ]),
  schedule("schedule_dev_23", "driver_dev", "2026-09-23", "09:30", "18:00", [
    { id: "break_dev_23_meal", startTime: "16:00", endTime: "16:30", reason: "meal" },
  ]),
  schedule("schedule_dev_24", "driver_dev", "2026-09-24", "09:30", "18:00", [
    { id: "break_dev_24_meal", startTime: "16:00", endTime: "16:30", reason: "meal" },
  ]),

  schedule("schedule_ananya_22", "driver_ananya", "2026-09-22", "09:30", "18:30", [
    { id: "break_ananya_22_meal", startTime: "12:00", endTime: "12:30", reason: "meal" },
  ]),
  schedule("schedule_ananya_23", "driver_ananya", "2026-09-23", "09:30", "18:30", [
    { id: "break_ananya_23_meal", startTime: "12:00", endTime: "12:30", reason: "meal" },
    { id: "break_ananya_23_personal", startTime: "16:30", endTime: "16:50", reason: "personal" },
  ]),
  schedule("schedule_ananya_24", "driver_ananya", "2026-09-24", "09:30", "18:30", [
    { id: "break_ananya_24_meal", startTime: "12:00", endTime: "12:30", reason: "meal" },
  ]),

  schedule("schedule_arjun_22", "driver_arjun", "2026-09-22", "07:00", "18:00", [
    { id: "break_arjun_22_meal", startTime: "12:30", endTime: "13:00", reason: "meal" },
  ]),
  schedule("schedule_arjun_24", "driver_arjun", "2026-09-24", "07:00", "18:00", [
    { id: "break_arjun_24_meal", startTime: "13:00", endTime: "13:30", reason: "meal" },
  ]),
];
