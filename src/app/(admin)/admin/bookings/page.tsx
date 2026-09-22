import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Booking Management",
  description: "View and update campus shuttle bookings.",
};

export default function AdminBookingsPage() {
  return (
    <PlaceholderPage
      title="Booking Management"
      description="All shuttle bookings will be listed here for review and updates."
    />
  );
}
