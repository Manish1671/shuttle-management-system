import type { Booking } from "@/types/booking";
import type { Trip } from "@/types/trip";
import type { ValidationError } from "@/lib/validation/result";
import { RepositoryError } from "@/services/repository/collection";

import {
  availableSeats,
  isTripBookable,
  prepareBooking,
  type CreateBookingRequest,
} from "./booking-rules";
import {
  bookingRepository,
  driverRepository,
  routeRepository,
  tripRepository,
  userRepository,
  vehicleRepository,
} from "./repository";

export type BookableTrip = {
  trip: Trip;
  availableSeats: number;
  routeName: string;
  routeCode: string;
  driverName: string;
  vehicleName: string;
};

export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; errors: ValidationError[] };

function bookingsForTrip(tripId: string, bookings: readonly Booking[]): Booking[] {
  return bookings.filter((booking) => booking.tripId === tripId);
}

export const bookingService = {
  getAll(): Booking[] {
    return bookingRepository.getAll();
  },
  getById(id: string): Booking | null {
    return bookingRepository.getById(id);
  },
  create(booking: Booking): Booking {
    return bookingRepository.create(booking);
  },
  update(id: string, patch: Partial<Omit<Booking, "id">>): Booking | null {
    return bookingRepository.update(id, patch);
  },
  delete(id: string): boolean {
    return bookingRepository.delete(id);
  },

  /**
   * Trips on a route and date that can still take a passenger.
   * Does not write to storage.
   */
  searchBookableTrips(routeId: string, serviceDate: string, now = new Date()): BookableTrip[] {
    const bookings = bookingRepository.getAll();
    const byTrip = new Map<string, Booking[]>();

    for (const booking of bookings) {
      const group = byTrip.get(booking.tripId) ?? [];
      group.push(booking);
      byTrip.set(booking.tripId, group);
    }

    return tripRepository
      .getAll()
      .filter((trip) => trip.routeId === routeId && trip.serviceDate === serviceDate)
      .filter((trip) => isTripBookable(trip, byTrip.get(trip.id) ?? [], now))
      .sort((left, right) => left.departureTime.localeCompare(right.departureTime))
      .map((trip) => {
        const route = routeRepository.getById(trip.routeId);
        const driver = driverRepository.getById(trip.driverId);
        const vehicle = vehicleRepository.getById(trip.vehicleId);
        const tripBookings = byTrip.get(trip.id) ?? [];

        return {
          trip,
          availableSeats: availableSeats(trip, tripBookings),
          routeName: route?.name ?? "Campus route",
          routeCode: route?.code ?? "",
          driverName: driver?.name ?? "Unassigned",
          vehicleName: vehicle?.displayName ?? "Unassigned",
        };
      });
  },

  createBooking(request: CreateBookingRequest, now = new Date()): CreateBookingResult {
    const bookings = bookingRepository.getAll();
    const trip = tripRepository.getById(request.tripId);
    const prepared = prepareBooking({
      request,
      user: userRepository.getById(request.userId),
      trip,
      route: trip ? routeRepository.getById(trip.routeId) : null,
      tripBookings: trip ? bookingsForTrip(trip.id, bookings) : [],
      existingBookings: bookings,
      now,
    });

    if (!prepared.ok) {
      return prepared;
    }

    try {
      const created = bookingRepository.create(prepared.value.booking);
      const updated = trip
        ? tripRepository.update(trip.id, { bookedSeats: prepared.value.bookedSeats })
        : null;

      if (!updated) {
        bookingRepository.delete(created.id);
        return {
          ok: false,
          errors: [
            {
              code: "REPOSITORY_FAILURE",
              message: "Unable to complete booking. Please try again.",
            },
          ],
        };
      }

      return { ok: true, booking: created };
    } catch (error) {
      if (error instanceof RepositoryError) {
        return {
          ok: false,
          errors: [
            {
              code: "REPOSITORY_FAILURE",
              message: "Unable to complete booking. Please try again.",
            },
          ],
        };
      }

      throw error;
    }
  },
};
