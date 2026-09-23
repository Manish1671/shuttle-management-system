import {
  BarChart3,
  Bus,
  CalendarClock,
  ClipboardList,
  History,
  LayoutDashboard,
  Route,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const riderNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/book", label: "Book Shuttle", icon: Ticket },
  { href: "/bookings", label: "My Bookings", icon: ClipboardList },
  { href: "/history", label: "Trip History", icon: History },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/drivers", label: "Drivers", icon: Users },
  { href: "/admin/routes", label: "Routes", icon: Route },
  { href: "/admin/trips", label: "Trips", icon: CalendarClock },
  { href: "/admin/vehicles", label: "Vehicles", icon: Bus },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/book": "Book Shuttle",
  "/bookings": "My Bookings",
  "/history": "Trip History",
  "/admin": "Admin Overview",
  "/admin/bookings": "Booking Management",
  "/admin/drivers": "Driver Management",
  "/admin/routes": "Route Management",
  "/admin/trips": "Trip Management",
  "/admin/vehicles": "Vehicles",
  "/admin/analytics": "Transport Analytics",
};

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin" || href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function titleForPath(pathname: string): string {
  return pageTitles[pathname] ?? "CampusRide";
}
