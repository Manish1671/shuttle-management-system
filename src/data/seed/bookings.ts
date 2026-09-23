import type { Booking, BookingStatus } from "@/types/booking";
import type { Route } from "@/types/route";
import type { Trip } from "@/types/trip";
import type { User } from "@/types/user";

import { routes } from "./routes";
import { trips } from "./trips";
import { users } from "./users";

function bookingStatus(trip: Trip, seatIndex: number): BookingStatus {
  if (trip.status === "cancelled") {
    return "cancelled";
  }

  if (trip.status === "completed") {
    return "completed";
  }

  if (trip.status === "scheduled" && seatIndex === 0) {
    return "pending";
  }

  return "confirmed";
}

function buildForTrip(
  trip: Trip,
  route: Route,
  riders: readonly User[],
  seatCount: number,
  status: BookingStatus,
): Booking[] {
  const lastIndex = route.stopIds.length - 1;

  return Array.from({ length: seatCount }, (_, seatIndex) => {
    const rider = riders[seatIndex % riders.length];
    const pickupIndex = Math.min(seatIndex % lastIndex, lastIndex - 1);
    const pickupStopId = route.stopIds[pickupIndex] ?? route.stopIds[0];
    const dropoffStopId = route.stopIds[lastIndex] ?? pickupStopId;

    return {
      id: `booking_${trip.id}_${seatIndex + 1}`,
      userId: rider?.id ?? "STU2026001",
      tripId: trip.id,
      pickupStopId: pickupStopId ?? "stop_main_gate",
      dropoffStopId: dropoffStopId ?? "stop_library",
      bookedAt: `${trip.serviceDate}T06:15`,
      status,
      seatNumber: seatIndex + 1,
    };
  });
}

export function createBookings(
  sourceTrips: readonly Trip[] = trips,
  sourceRoutes: readonly Route[] = routes,
  sourceUsers: readonly User[] = users,
): Booking[] {
  const riders = sourceUsers.filter((user) => user.role === "rider");
  const routesById = new Map(sourceRoutes.map((route) => [route.id, route]));
  const bookings: Booking[] = [];

  for (const trip of sourceTrips) {
    const route = routesById.get(trip.routeId);
    if (!route) {
      continue;
    }

    if (trip.status === "cancelled") {
      bookings.push(
        ...buildForTrip(trip, route, riders, 3, "cancelled").map((booking) => ({
          ...booking,
          seatNumber: undefined,
        })),
      );
      continue;
    }

    bookings.push(
      ...buildForTrip(trip, route, riders, trip.bookedSeats, "confirmed").map(
        (booking, seatIndex) => ({
          ...booking,
          status: bookingStatus(trip, seatIndex),
        }),
      ),
    );
  }

  return bookings;
}

export const bookings: Booking[] = createBookings();
