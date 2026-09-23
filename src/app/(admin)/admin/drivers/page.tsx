import type { Metadata } from "next";

import { AdminDrivers } from "@/features/admin-drivers/admin-drivers";

export const metadata: Metadata = {
  title: "Driver Management",
  description: "Manage drivers, duty schedules, breaks, and availability.",
};

export default function AdminDriversPage() {
  return <AdminDrivers />;
}
