import type { Metadata } from "next";

import { AdminTrips } from "@/features/admin-trips/admin-trips";

export const metadata: Metadata = {
  title: "Trip Management",
  description: "Schedule shuttle trips, assign drivers and vehicles, and monitor trip capacity.",
};

export default function AdminTripsPage() {
  return <AdminTrips />;
}
