import type { Booking } from "@/types/booking";
import type { Driver } from "@/types/driver";
import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";
import type { Trip } from "@/types/trip";
import type { User } from "@/types/user";
import type { Vehicle } from "@/types/vehicle";

import { cancellationError, classifyBooking, type BookingSection } from "./booking-rules";

export type BookingViewModel = {
  booking: Booking;
  trip: Trip | null;
  route: Route | null;
  driver: Driver | null;
  vehicle: Vehicle | null;
  pickupStop: Stop | null;
  dropoffStop: Stop | null;
  passengerName: string;
  section: BookingSection;
  canCancel: boolean;
};

export type BookingRecords = {
  trips: readonly Trip[];
  routes: readonly Route[];
  drivers: readonly Driver[];
  vehicles: readonly Vehicle[];
  stops: readonly Stop[];
  users: readonly User[];
};

export function tripSortKey(view: BookingViewModel): string {
  const date = view.trip?.serviceDate ?? "0000-00-00";
  const time = view.trip?.departureTime ?? "00:00";
  return `${date}T${time}`;
}

export function toBookingViewModel(
  booking: Booking,
  records: BookingRecords,
  now = new Date(),
): BookingViewModel {
  const trip = records.trips.find((item) => item.id === booking.tripId) ?? null;
  const route = trip ? records.routes.find((item) => item.id === trip.routeId) ?? null : null;
  const driver = trip ? records.drivers.find((item) => item.id === trip.driverId) ?? null : null;
  const vehicle = trip ? records.vehicles.find((item) => item.id === trip.vehicleId) ?? null : null;
  const pickupStop = records.stops.find((item) => item.id === booking.pickupStopId) ?? null;
  const dropoffStop = records.stops.find((item) => item.id === booking.dropoffStopId) ?? null;
  const passenger = records.users.find((item) => item.id === booking.userId) ?? null;

  return {
    booking,
    trip,
    route,
    driver,
    vehicle,
    pickupStop,
    dropoffStop,
    passengerName: passenger?.name ?? "Rider",
    section: classifyBooking(booking, trip, now),
    canCancel: cancellationError(booking, trip, booking.userId, now) === null,
  };
}
