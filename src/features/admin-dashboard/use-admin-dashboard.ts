"use client";

import { useSyncExternalStore } from "react";

import { bookingService } from "@/services/booking-service";
import {
  getBookingRevision,
  getServerBookingRevision,
  notifyBookingsChanged,
  subscribeBookingChanges,
} from "@/services/booking-sync";
import { driverService } from "@/services/driver-service";
import { routeService } from "@/services/route-service";
import { scheduleService } from "@/services/schedule-service";
import { stopService } from "@/services/stop-service";
import { tripService } from "@/services/trip-service";
import { userService } from "@/services/user-service";
import { vehicleService } from "@/services/vehicle-service";

import { buildAdminDashboard } from "./dashboard-metrics";
import type { AdminDashboard } from "./dashboard-types";

export type AdminDashboardState = {
  status: "loading" | "ready" | "error";
  message: string | null;
  data: AdminDashboard | null;
  retry: () => void;
};

export function useAdminDashboard(): AdminDashboardState {
  const revision = useSyncExternalStore(
    subscribeBookingChanges,
    getBookingRevision,
    getServerBookingRevision,
  );

  if (revision === 0) {
    return { status: "loading", message: null, data: null, retry: notifyBookingsChanged };
  }

  try {
    return {
      status: "ready",
      message: null,
      retry: notifyBookingsChanged,
      data: buildAdminDashboard({
        trips: tripService.getAll(),
        bookings: bookingService.getAll(),
        drivers: driverService.getAll(),
        vehicles: vehicleService.getAll(),
        routes: routeService.getAll(),
        stops: stopService.getAll(),
        users: userService.getAll(),
        schedules: scheduleService.getAll(),
      }),
    };
  } catch {
    return {
      status: "error",
      message: "Unable to load dashboard data.",
      data: null,
      retry: notifyBookingsChanged,
    };
  }
}
