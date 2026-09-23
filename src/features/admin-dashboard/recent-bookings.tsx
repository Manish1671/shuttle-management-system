import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/features/bookings/booking-status-badge";
import { formatDisplayDate } from "@/lib/time";

import type { RecentBookingRow } from "./dashboard-types";
import { DashboardEmpty, DashboardPanel } from "./dashboard-panel";

export function RecentBookings({ bookings }: { bookings: RecentBookingRow[] }) {
  return (
    <DashboardPanel
      title="Recent bookings"
      description="Newest reservations across the campus network."
      action={
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/bookings">View all bookings</Link>
        </Button>
      }
    >
      {bookings.length === 0 ? (
        <DashboardEmpty
          title="No recent bookings"
          description="New shuttle reservations will appear here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <caption className="sr-only">Recent shuttle bookings</caption>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th scope="col" className="px-2 py-2 font-medium">Booking</th>
                <th scope="col" className="px-2 py-2 font-medium">Passenger</th>
                <th scope="col" className="px-2 py-2 font-medium">Route</th>
                <th scope="col" className="px-2 py-2 font-medium">Pickup</th>
                <th scope="col" className="px-2 py-2 font-medium">Destination</th>
                <th scope="col" className="px-2 py-2 font-medium">Trip</th>
                <th scope="col" className="px-2 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-3 font-medium">{booking.id}</td>
                  <td className="px-2 py-3">{booking.passengerName}</td>
                  <td className="px-2 py-3">{booking.routeCode}</td>
                  <td className="px-2 py-3">{booking.pickupName}</td>
                  <td className="px-2 py-3">{booking.dropoffName}</td>
                  <td className="px-2 py-3">
                    {booking.serviceDate ? formatDisplayDate(booking.serviceDate) : "Date unavailable"}
                    <span className="mt-0.5 block text-xs text-muted-foreground">{booking.departureTime}</span>
                  </td>
                  <td className="px-2 py-3">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  );
}
