import type { BookingViewModel } from "@/services/booking-view";

export type BookingStatusFilter = "all" | "confirmed" | "cancelled";

export type BookingDateFilter = "all" | "today" | "upcoming" | "past";

export type AdminBookingFilters = {
  query: string;
  status: BookingStatusFilter;
  date: BookingDateFilter;
  routeId: string;
};

export type AdminBookingRow = {
  view: BookingViewModel;
  riderId: string;
  riderTypeLabel: string;
  cancelBlockReason: string | null;
};

export type AdminBookingMetrics = {
  total: number;
  confirmed: number;
  cancelled: number;
  today: number;
};

export type AdminRouteOption = {
  id: string;
  label: string;
};

export const defaultBookingFilters: AdminBookingFilters = {
  query: "",
  status: "all",
  date: "all",
  routeId: "all",
};
