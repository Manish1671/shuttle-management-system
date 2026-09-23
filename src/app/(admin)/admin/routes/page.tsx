import type { Metadata } from "next";

import { AdminRoutes } from "@/features/admin-routes/admin-routes";

export const metadata: Metadata = {
  title: "Route Management",
  description: "Manage campus shuttle routes, stops, and service availability.",
};

export default function AdminRoutesPage() {
  return <AdminRoutes />;
}
