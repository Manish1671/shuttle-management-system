"use client";

import { useSyncExternalStore } from "react";

import { bookingService, type RiderBookings } from "@/services/booking-service";
import {
  getBookingRevision,
  getServerBookingRevision,
  notifyBookingsChanged,
  subscribeBookingChanges,
} from "@/services/booking-sync";

const empty: RiderBookings = {
  upcoming: [],
  past: [],
  cancelled: [],
};

export type RiderBookingState = RiderBookings & {
  status: "loading" | "ready" | "error";
  message: string | null;
  retry: () => void;
};

export function useRiderBookings(userId: string | undefined): RiderBookingState {
  const revision = useSyncExternalStore(
    subscribeBookingChanges,
    getBookingRevision,
    getServerBookingRevision,
  );

  if (!userId || revision === 0) {
    return { status: "loading", message: null, retry: notifyBookingsChanged, ...empty };
  }

  try {
    return {
      status: "ready",
      message: null,
      retry: notifyBookingsChanged,
      ...bookingService.getBookingsForUser(userId),
    };
  } catch {
    return {
      status: "error",
      message: "Unable to load bookings. Please try again.",
      retry: notifyBookingsChanged,
      ...empty,
    };
  }
}
