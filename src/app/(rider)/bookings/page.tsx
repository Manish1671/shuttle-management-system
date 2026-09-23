import type { Metadata } from "next";

import { MyBookings } from "@/features/bookings/my-bookings";

export const metadata: Metadata = {
  title: "My Bookings",
  description: "View and manage your campus shuttle reservations.",
};

export default function MyBookingsPage() {
  return <MyBookings />;
}
