"use client";

import { useSyncExternalStore } from "react";

import {
  getBookingRevision,
  getServerBookingRevision,
  notifyBookingsChanged,
  subscribeBookingChanges,
} from "@/services/booking-sync";
import type { Stop } from "@/types/stop";

import { loadRouteManagement } from "./route-data";
import type { RouteViewModel } from "./route-types";

export type AdminRoutesState = {
  status: "loading" | "ready" | "error";
  routes: RouteViewModel[];
  stops: Stop[];
  retry: () => void;
};

export function useAdminRoutes(): AdminRoutesState {
  const revision = useSyncExternalStore(
    subscribeBookingChanges,
    getBookingRevision,
    getServerBookingRevision,
  );

  if (revision === 0) {
    return { status: "loading", routes: [], stops: [], retry: notifyBookingsChanged };
  }

  try {
    const data = loadRouteManagement();
    return { status: "ready", routes: data.routes, stops: data.stops, retry: notifyBookingsChanged };
  } catch {
    return { status: "error", routes: [], stops: [], retry: notifyBookingsChanged };
  }
}
