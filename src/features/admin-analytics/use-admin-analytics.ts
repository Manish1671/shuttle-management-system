"use client";

import { useSyncExternalStore } from "react";

import {
  getBookingRevision,
  getServerBookingRevision,
  notifyBookingsChanged,
  subscribeBookingChanges,
} from "@/services/booking-sync";
import { bookingService } from "@/services/booking-service";
import { driverService } from "@/services/driver-service";
import { routeService } from "@/services/route-service";
import { tripService } from "@/services/trip-service";
import { vehicleService } from "@/services/vehicle-service";

import { datasetBounds, type AnalyticsRecords } from "./analytics-metrics";

export type AdminAnalyticsState =
  | { status: "loading"; retry: () => void }
  | { status: "error"; retry: () => void }
  | { status: "ready"; retry: () => void; records: AnalyticsRecords; bounds: { start: string; end: string } | null };

export function useAdminAnalytics(): AdminAnalyticsState {
  const revision = useSyncExternalStore(
    subscribeBookingChanges,
    getBookingRevision,
    getServerBookingRevision,
  );

  if (revision === 0) {
    return { status: "loading", retry: notifyBookingsChanged };
  }

  try {
    const records: AnalyticsRecords = {
      trips: tripService.getAll(),
      bookings: bookingService.getAll(),
      routes: routeService.getAll(),
      drivers: driverService.getAll(),
      vehicles: vehicleService.getAll(),
    };
    return { status: "ready", records, bounds: datasetBounds(records.trips), retry: notifyBookingsChanged };
  } catch {
    return { status: "error", retry: notifyBookingsChanged };
  }
}
