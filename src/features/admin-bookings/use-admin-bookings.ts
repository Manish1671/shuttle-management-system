"use client";

import { useSyncExternalStore } from "react";

import {
  getBookingRevision,
  getServerBookingRevision,
  notifyBookingsChanged,
  subscribeBookingChanges,
} from "@/services/booking-sync";

import { loadAdminBookings } from "./admin-bookings-data";
import type { AdminBookingRow, AdminRouteOption } from "./admin-bookings-types";

export type AdminBookingsState = {
  status: "loading" | "ready" | "error";
  message: string | null;
  rows: AdminBookingRow[];
  routes: AdminRouteOption[];
  retry: () => void;
};

export function useAdminBookings(): AdminBookingsState {
  const revision = useSyncExternalStore(
    subscribeBookingChanges,
    getBookingRevision,
    getServerBookingRevision,
  );

  if (revision === 0) {
    return {
      status: "loading",
      message: null,
      rows: [],
      routes: [],
      retry: notifyBookingsChanged,
    };
  }

  try {
    const data = loadAdminBookings();
    return {
      status: "ready",
      message: null,
      rows: data.rows,
      routes: data.routes,
      retry: notifyBookingsChanged,
    };
  } catch {
    return {
      status: "error",
      message: "Unable to load bookings. Please try again.",
      rows: [],
      routes: [],
      retry: notifyBookingsChanged,
    };
  }
}
