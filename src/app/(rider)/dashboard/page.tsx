import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Rider home for upcoming campus shuttle rides.",
};

export default function DashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Your upcoming campus shuttle rides will appear here."
    />
  );
}
