import type { Metadata } from "next";

import { TripHistory } from "@/features/history/trip-history";

export const metadata: Metadata = {
  title: "Trip History",
  description: "Completed and cancelled campus shuttle trips.",
};

export default function TripHistoryPage() {
  return <TripHistory />;
}