import type { Metadata } from "next";

import { RiderDashboard } from "@/features/rider-dashboard/rider-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your upcoming campus shuttle rides.",
};

export default function DashboardPage() {
  return <RiderDashboard />;
}
