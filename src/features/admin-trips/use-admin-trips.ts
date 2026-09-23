"use client";

import { useSyncExternalStore } from "react";

import {
  getBookingRevision,
  getServerBookingRevision,
  notifyBookingsChanged,
  subscribeBookingChanges,
} from "@/services/booking-sync";

import { loadTripManagement, type TripManagementData } from "./trip-data";

export type AdminTripsState =
  | { status: "loading"; retry: () => void }
  | { status: "error"; retry: () => void }
  | ({ status: "ready"; retry: () => void } & TripManagementData);

export function useAdminTrips(): AdminTripsState {
  const revision = useSyncExternalStore(
    subscribeBookingChanges,
    getBookingRevision,
    getServerBookingRevision,
  );

  if (revision === 0) {
    return { status: "loading", retry: notifyBookingsChanged };
  }

  try {
    return { status: "ready", ...loadTripManagement(), retry: notifyBookingsChanged };
  } catch {
    return { status: "error", retry: notifyBookingsChanged };
  }
}
