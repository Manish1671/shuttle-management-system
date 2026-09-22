import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Trips",
  description: "Scheduled shuttle trips and driver assignments.",
};

export default function AdminTripsPage() {
  return (
    <PlaceholderPage
      title="Trips"
      description="Scheduled trips and the drivers assigned to them will appear here."
    />
  );
}
