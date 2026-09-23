export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

export type Booking = {
  id: string;
  userId: string;
  tripId: string;
  pickupStopId: string;
  dropoffStopId: string;
  /** Local date-time, YYYY-MM-DDTHH:mm. */
  bookedAt: string;
  status: BookingStatus;
  seatNumber?: number;
};
