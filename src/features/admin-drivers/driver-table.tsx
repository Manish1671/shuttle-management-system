import { Button } from "@/components/ui/button";

import { driverStatusLabel } from "./driver-data";
import type { DriverDayView } from "./driver-types";

const statusClass: Record<DriverDayView["status"], string> = {
  available: "border-success/30 bg-success/10 text-success",
  on_trip: "border-info/30 bg-info/10 text-info",
  on_break: "border-warning/30 bg-warning/10 text-warning",
  off_duty: "border-border bg-muted text-muted-foreground",
};

function tripCount(view: DriverDayView): string {
  const count = view.trips.filter((item) => item.trip.status !== "cancelled").length;
  return `${count} ${count === 1 ? "trip" : "trips"}`;
}

export function DriverStatusBadge({ status }: { status: DriverDayView["status"] }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass[status]}`}>
      {driverStatusLabel[status]}
    </span>
  );
}

export function DriverTable({
  views,
  onView,
}: {
  views: DriverDayView[];
  onView: (driverId: string) => void;
}) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <caption className="sr-only">Campus shuttle drivers</caption>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th scope="col" className="px-2 py-2 font-medium">Driver</th>
              <th scope="col" className="px-2 py-2 font-medium">Employee ID</th>
              <th scope="col" className="px-2 py-2 font-medium">Phone</th>
              <th scope="col" className="px-2 py-2 font-medium">Status</th>
              <th scope="col" className="px-2 py-2 font-medium">Duty</th>
              <th scope="col" className="px-2 py-2 font-medium">Trips</th>
              <th scope="col" className="px-2 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {views.map((view) => (
              <tr key={view.driver.id} className="border-b border-border last:border-0">
                <td className="px-2 py-3 font-medium">{view.driver.name}</td>
                <td className="px-2 py-3">{view.driver.employeeId}</td>
                <td className="px-2 py-3">{view.driver.phone}</td>
                <td className="px-2 py-3">
                  <DriverStatusBadge status={view.status} />
                  {view.conflicts.length > 0 ? (
                    <span className="mt-1 block text-xs text-destructive">Schedule conflict</span>
                  ) : null}
                </td>
                <td className="px-2 py-3">
                  {view.schedule ? `${view.schedule.dutyStart}–${view.schedule.dutyEnd}` : "No schedule"}
                </td>
                <td className="px-2 py-3">{tripCount(view)}</td>
                <td className="px-2 py-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => onView(view.driver.id)}>
                    View {view.driver.name}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid gap-3 md:hidden">
        {views.map((view) => (
          <li key={view.driver.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{view.driver.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{view.driver.employeeId}</p>
                <p className="text-xs text-muted-foreground">{view.driver.phone}</p>
              </div>
              <DriverStatusBadge status={view.status} />
            </div>
            <p className="mt-3 text-sm">
              {view.schedule ? `Duty ${view.schedule.dutyStart}–${view.schedule.dutyEnd}` : "No schedule"}
              <span className="text-muted-foreground"> · {tripCount(view)}</span>
            </p>
            {view.conflicts.length > 0 ? <p className="mt-1 text-xs text-destructive">Schedule conflict</p> : null}
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => onView(view.driver.id)}>
              View {view.driver.name}
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
