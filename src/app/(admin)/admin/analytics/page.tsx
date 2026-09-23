import type { Metadata } from "next";

import { AdminAnalytics } from "@/features/admin-analytics/admin-analytics";

export const metadata: Metadata = {
  title: "Transport Analytics",
  description: "Understand shuttle demand, route utilization, occupancy, and operational performance.",
};

export default function AdminAnalyticsPage() {
  return <AdminAnalytics />;
}
