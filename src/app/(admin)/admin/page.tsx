import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Admin Overview",
  description: "Transport office overview for campus shuttle operations.",
};

export default function AdminOverviewPage() {
  return (
    <PlaceholderPage
      title="Overview"
      description="Shuttle usage and demand for the campus network will appear here."
    />
  );
}
