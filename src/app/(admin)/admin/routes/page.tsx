import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Route Management",
  description: "Campus shuttle routes and stops.",
};

export default function AdminRoutesPage() {
  return (
    <PlaceholderPage
      title="Route Management"
      description="Shuttle routes and their pickup and drop-off points will be defined here."
    />
  );
}
