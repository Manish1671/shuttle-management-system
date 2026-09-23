import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/features/bookings/booking-status-badge";
import { formatDisplayDate } from "@/lib/time";

import type { TripViewModel } from "./trip-data";
import { TripMobileCard } from "./trip-mobile-card";

export function TripTable({
  trips,
  onView,
}: {
  trips: TripViewModel[];
  onView: (tripId: string) => void;
}) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <caption className="sr-only">Campus shuttle trips</caption>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th scope="col" className="px-2 py-2 font-medium">Trip</th>
              <th scope="col" className="px-2 py-2 font-medium">Date</th>
              <th scope="col" className="px-2 py-2 font-medium">Departure</th>
              <th scope="col" className="px-2 py-2 font-medium">Route</th>
              <th scope="col" className="px-2 py-2 font-medium">Driver</th>
              <th scope="col" className="px-2 py-2 font-medium">Vehicle</th>
              <th scope="col" className="px-2 py-2 font-medium">Capacity</th>
              <th scope="col" className="px-2 py-2 font-medium">Booked</th>
              <th scope="col" className="px-2 py-2 font-medium">Status</th>
              <th scope="col" className="px-2 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((view) => (
              <tr key={view.trip.id} className="border-b border-border last:border-0">
                <td className="px-2 py-3">
                  <span className="font-medium">{view.route?.name ?? "Unknown route"}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{view.trip.id}</span>
                </td>
                <td className="px-2 py-3">{formatDisplayDate(view.trip.serviceDate)}</td>
                <td className="px-2 py-3">{view.trip.departureTime}</td>
                <td className="px-2 py-3">{view.route?.code ?? "—"}</td>
                <td className="px-2 py-3">
                  <span>{view.driver?.name ?? "Unassigned"}</span>
                  {view.driver ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">{view.driver.employeeId}</span>
                  ) : null}
                </td>
                <td className="px-2 py-3">{view.vehicle?.registrationNumber ?? "—"}</td>
                <td className="px-2 py-3">{view.trip.capacity}</td>
                <td className="px-2 py-3">{view.occupied}</td>
                <td className="px-2 py-3">
                  <BookingStatusBadge status={view.trip.status} kind="trip" />
                </td>
                <td className="px-2 py-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => onView(view.trip.id)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {trips.map((view) => (
          <TripMobileCard key={view.trip.id} view={view} onView={onView} />
        ))}
      </div>
    </>
  );
}
