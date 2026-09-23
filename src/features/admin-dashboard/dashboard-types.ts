import type { BookingStatus } from "@/types/booking";
import type { DriverStatus } from "@/types/driver";
import type { TripStatus } from "@/types/trip";

export type DashboardKpi = {
  id: string;
  label: string;
  value: number;
  context: string;
};

export type TodayTripRow = {
  id: string;
  departureTime: string;
  routeCode: string;
  routeName: string;
  driverName: string;
  vehicleName: string;
  bookedSeats: number;
  capacity: number;
  status: TripStatus;
};

export type RecentBookingRow = {
  id: string;
  passengerName: string;
  routeCode: string;
  pickupName: string;
  dropoffName: string;
  departureTime: string;
  serviceDate: string;
  status: BookingStatus;
  bookedAt: string;
};

export type DriverStatusCounts = Record<DriverStatus, number>;

export type DemandPoint = {
  hour: string;
  bookings: number;
};

export type PeakDemand = {
  hour: string;
  bookings: number;
};

export type RouteUtilizationRow = {
  routeId: string;
  code: string;
  name: string;
  bookings: number;
  capacity: number;
  utilizationLabel: string;
};

export type DashboardAlert = {
  id: string;
  title: string;
  detail: string;
};

export type AdminDashboard = {
  serviceDate: string;
  kpis: DashboardKpi[];
  trips: TodayTripRow[];
  recentBookings: RecentBookingRow[];
  driverStatus: DriverStatusCounts;
  demand: DemandPoint[];
  peaks: PeakDemand[];
  routes: RouteUtilizationRow[];
  alerts: DashboardAlert[];
};
