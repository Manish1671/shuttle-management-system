import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Trip History",
  description: "Past campus shuttle trips for the signed-in rider.",
};

export default function TripHistoryPage() {
  return (
    <PlaceholderPage
      title="Trip History"
      description="Past trips will show the date, time, route, and driver."
    />
  );
}
