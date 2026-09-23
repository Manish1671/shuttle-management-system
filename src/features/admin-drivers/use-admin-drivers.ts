"use client";

import { useSyncExternalStore } from "react";

import {
  getBookingRevision,
  getServerBookingRevision,
  notifyBookingsChanged,
  subscribeBookingChanges,
} from "@/services/booking-sync";

import { loadDriverDay } from "./driver-data";
import type { DriverDayView } from "./driver-types";

export type AdminDriversState = {
  status: "loading" | "ready" | "error";
  views: DriverDayView[];
  retry: () => void;
};

export function useAdminDrivers(date: string): AdminDriversState {
  const revision = useSyncExternalStore(
    subscribeBookingChanges,
    getBookingRevision,
    getServerBookingRevision,
  );

  if (revision === 0) {
    return { status: "loading", views: [], retry: notifyBookingsChanged };
  }

  try {
    return { status: "ready", views: loadDriverDay(date), retry: notifyBookingsChanged };
  } catch {
    return { status: "error", views: [], retry: notifyBookingsChanged };
  }
}
