import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Shuttle usage and peak-hour demand.",
};

export default function AdminAnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Peak hours and shuttle demand will be shown here so schedules can be adjusted."
    />
  );
}