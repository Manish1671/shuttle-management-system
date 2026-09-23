import type { Metadata } from "next";

import { AdminBookings } from "@/features/admin-bookings/admin-bookings";

export const metadata: Metadata = {
  title: "Booking Management",
  description: "View and manage shuttle bookings across campus routes.",
};

export default function AdminBookingsPage() {
  return <AdminBookings />;
}
