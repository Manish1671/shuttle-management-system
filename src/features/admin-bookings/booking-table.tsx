import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/features/bookings/booking-status-badge";

import { formatBookingDate } from "./admin-bookings-data";
import type { AdminBookingRow } from "./admin-bookings-types";

export function BookingTable({
  rows,
  onView,
}: {
  rows: AdminBookingRow[];
  onView: (row: AdminBookingRow) => void;
}) {
  return (
    <div className="hidden min-w-0 max-w-full overflow-x-auto md:block">
      <table className="w-full min-w-[64rem] text-left text-sm">
        <caption className="sr-only">Campus shuttle bookings</caption>
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th scope="col" className="px-2 py-2 font-medium">Booking</th>
            <th scope="col" className="px-2 py-2 font-medium">Rider</th>
            <th scope="col" className="px-2 py-2 font-medium">Route</th>
            <th scope="col" className="px-2 py-2 font-medium">Trip</th>
            <th scope="col" className="px-2 py-2 font-medium">Journey</th>
            <th scope="col" className="px-2 py-2 font-medium">Date</th>
            <th scope="col" className="px-2 py-2 font-medium">Departure</th>
            <th scope="col" className="px-2 py-2 font-medium">Seat</th>
            <th scope="col" className="px-2 py-2 font-medium">Status</th>
            <th scope="col" className="px-2 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { view } = row;
            return (
              <tr key={view.booking.id} className="border-b border-border last:border-0">
                <td className="px-2 py-3 font-medium">{view.booking.id}</td>
                <td className="px-2 py-3">
                  <span className="font-medium">{view.passengerName}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{row.riderId}</span>
                </td>
                <td className="px-2 py-3">
                  <span className="font-medium">{view.route?.code ?? "Route"}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {view.route?.name ?? "Unavailable"}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <span className="font-medium">{view.route?.code ?? "Trip"}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {view.trip?.id ?? "Unavailable"}
                  </span>
                </td>
                <td className="px-2 py-3">
                  {view.pickupStop?.name ?? "Pickup"}
                  <span className="text-muted-foreground"> → </span>
                  {view.dropoffStop?.name ?? "Destination"}
                </td>
                <td className="px-2 py-3">
                  {view.trip ? formatBookingDate(view.trip.serviceDate) : "Unavailable"}
                </td>
                <td className="px-2 py-3">{view.trip?.departureTime ?? "--:--"}</td>
                <td className="px-2 py-3">{view.booking.seatNumber ?? "—"}</td>
                <td className="px-2 py-3">
                  <BookingStatusBadge status={view.booking.status} />
                </td>
                <td className="px-2 py-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => onView(row)}>
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
