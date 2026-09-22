import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Driver Management",
  description: "Driver profiles and duty schedules.",
};

export default function AdminDriversPage() {
  return (
    <PlaceholderPage
      title="Driver Management"
      description="Driver profiles, duty hours, and breaks will be managed here."
    />
  );
}
