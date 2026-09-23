export type BreakReason = "meal" | "rest" | "personal" | "other";

export type DriverBreak = {
  id: string;
  driverScheduleId: string;
  /** HH:mm */
  startTime: string;
  /** HH:mm */
  endTime: string;
  reason: BreakReason;
};

export type DriverSchedule = {
  id: string;
  driverId: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  dutyStart: string;
  /** HH:mm */
  dutyEnd: string;
  breaks: DriverBreak[];
};
