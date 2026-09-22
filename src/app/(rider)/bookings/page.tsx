import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "My Bookings",
  description: "Upcoming shuttle bookings for the signed-in rider.",
};

export default function MyBookingsPage() {
  return (
    <PlaceholderPage
      title="My Bookings"
      description="Upcoming shuttle bookings will be listed here."
    />
  );
}
