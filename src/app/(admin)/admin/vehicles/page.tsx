import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Vehicles",
  description: "Campus shuttle vehicles.",
};

export default function AdminVehiclesPage() {
  return (
    <PlaceholderPage
      title="Vehicles"
      description="Shuttle vehicles used on campus routes will be listed here."
    />
  );
}
