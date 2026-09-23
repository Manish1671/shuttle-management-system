export type TripStatus =
  | "scheduled"
  | "boarding"
  | "in_progress"
  | "completed"
  | "cancelled";

export type Trip = {
  id: string;
  routeId: string;
  vehicleId: string;
  driverId: string;
  /** Calendar date, YYYY-MM-DD. */
  serviceDate: string;
  /** Departure time, HH:mm. */
  departureTime: string;
  /** Arrival time, HH:mm. */
  arrivalTime: string;
  capacity: number;
  /** Count of bookings whose status is not cancelled. */
  bookedSeats: number;
  status: TripStatus;
};
