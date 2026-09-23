import type { Booking } from "@/types/booking";
import type { Trip } from "@/types/trip";
import type { ValidationError } from "@/lib/validation/result";
import { RepositoryError } from "@/services/repository/collection";

import {
  availableSeats,
  cancellationError,
  countOccupiedSeats,
  isTripBookable,
  prepareBooking,
  type CreateBookingRequest,
} from "./booking-rules";
import { notifyBookingsChanged } from "./booking-sync";
import { toBookingViewModel, tripSortKey, type BookingViewModel } from "./booking-view";
import {
  bookingRepository,
  driverRepository,
  routeRepository,
  stopRepository,
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

export type RiderBookings = {
  upcoming: BookingViewModel[];
  past: BookingViewModel[];
  cancelled: BookingViewModel[];
};

export type BookingDetailsResult =
  | { ok: true; booking: BookingViewModel }
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

      notifyBookingsChanged();
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

  getBookingsForUser(userId: string, now = new Date()): RiderBookings {
    const records = {
      trips: tripRepository.getAll(),
      routes: routeRepository.getAll(),
      drivers: driverRepository.getAll(),
      vehicles: vehicleRepository.getAll(),
      stops: stopRepository.getAll(),
      users: userRepository.getAll(),
    };
    const views = bookingRepository
      .getAll()
      .filter((booking) => booking.userId === userId)
      .map((booking) => toBookingViewModel(booking, records, now));

    const byTime = (left: BookingViewModel, right: BookingViewModel) =>
      tripSortKey(left).localeCompare(tripSortKey(right));

    return {
      upcoming: views.filter((view) => view.section === "upcoming").sort(byTime),
      past: views.filter((view) => view.section === "past").sort((left, right) => byTime(right, left)),
      cancelled: views
        .filter((view) => view.section === "cancelled")
        .sort((left, right) => byTime(right, left)),
    };
  },

  getBookingDetails(bookingId: string, userId: string, now = new Date()): BookingDetailsResult {
    const booking = bookingRepository.getById(bookingId);
    if (!booking || booking.userId !== userId) {
      return {
        ok: false,
        errors: [{ code: "NOT_OWNER", message: "You can only view your own booking." }],
      };
    }

    const grouped = this.getBookingsForUser(userId, now);
    const view = [...grouped.upcoming, ...grouped.past, ...grouped.cancelled].find(
      (item) => item.booking.id === bookingId,
    );

    if (!view) {
      return {
        ok: false,
        errors: [{ code: "BOOKING_NOT_FOUND", message: "This booking could not be found." }],
      };
    }

    return { ok: true, booking: view };
  },

  cancelBooking(bookingId: string, userId: string, now = new Date()): BookingDetailsResult {
    const booking = bookingRepository.getById(bookingId);
    const trip = booking ? tripRepository.getById(booking.tripId) : null;
    const blocked = cancellationError(booking, trip, userId, now);

    if (blocked || !booking) {
      return {
        ok: false,
        errors: [
          blocked ?? { code: "BOOKING_NOT_FOUND", message: "This booking could not be found." },
        ],
      };
    }

    try {
      const updated = bookingRepository.update(booking.id, { status: "cancelled" });
      if (!updated || !trip) {
        return {
          ok: false,
          errors: [
            {
              code: "REPOSITORY_FAILURE",
              message: "Unable to cancel this booking. Please try again.",
            },
          ],
        };
      }

      const occupied = countOccupiedSeats(bookingsForTrip(trip.id, bookingRepository.getAll()));
      const tripUpdated = tripRepository.update(trip.id, { bookedSeats: occupied });
      if (!tripUpdated) {
        bookingRepository.update(booking.id, { status: booking.status });
        return {
          ok: false,
          errors: [
            {
              code: "REPOSITORY_FAILURE",
              message: "Unable to cancel this booking. Please try again.",
            },
          ],
        };
      }

      notifyBookingsChanged();
      return this.getBookingDetails(updated.id, userId, now);
    } catch (error) {
      if (error instanceof RepositoryError) {
        return {
          ok: false,
          errors: [
            {
              code: "REPOSITORY_FAILURE",
              message: "Unable to cancel this booking. Please try again.",
            },
          ],
        };
      }

      throw error;
    }
  },
};
