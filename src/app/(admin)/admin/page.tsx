import type { Metadata } from "next";

import { AdminDashboard } from "@/features/admin-dashboard/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Overview",
  description: "Transport operations at a glance.",
};

export default function AdminOverviewPage() {
  return <AdminDashboard />;
}
