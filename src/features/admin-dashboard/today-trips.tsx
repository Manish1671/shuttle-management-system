import { BookingStatusBadge } from "@/features/bookings/booking-status-badge";

import type { TodayTripRow } from "./dashboard-types";
import { DashboardEmpty, DashboardPanel } from "./dashboard-panel";

export function TodayTrips({ trips }: { trips: TodayTripRow[] }) {
  return (
    <DashboardPanel
      title="Today's trips"
      description="Read-only timetable for the current service date."
    >
      {trips.length === 0 ? (
        <DashboardEmpty
          title="No trips today"
          description="Trips scheduled for this service date will appear here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Today&apos;s shuttle trips</caption>
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th scope="col" className="px-2 py-2 font-medium">Departure</th>
                <th scope="col" className="px-2 py-2 font-medium">Route</th>
                <th scope="col" className="px-2 py-2 font-medium">Driver</th>
                <th scope="col" className="px-2 py-2 font-medium">Vehicle</th>
                <th scope="col" className="px-2 py-2 font-medium">Bookings</th>
                <th scope="col" className="px-2 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-b border-border last:border-0">
                  <td className="px-2 py-3 font-medium">{trip.departureTime}</td>
                  <td className="px-2 py-3">
                    <span className="font-medium">{trip.routeCode}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{trip.routeName}</span>
                  </td>
                  <td className="px-2 py-3">{trip.driverName}</td>
                  <td className="px-2 py-3">{trip.vehicleName}</td>
                  <td className="px-2 py-3">
                    {trip.bookedSeats} / {trip.capacity}
                  </td>
                  <td className="px-2 py-3">
                    <BookingStatusBadge status={trip.status} kind="trip" />
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
