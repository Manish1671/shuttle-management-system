import { BookingStatusBadge } from "@/features/bookings/booking-status-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { DriverTimeline, TimelineLegend } from "./timeline-view";
import { DriverBreakEditor } from "./driver-break-editor";
import { DriverScheduleEditor } from "./driver-schedule-editor";
import { DriverStatusBadge } from "./driver-table";
import type { DriverDayView } from "./driver-types";

export function DriverDetailsSheet({
  view,
  date,
  onOpenChange,
}: {
  view: DriverDayView | null;
  date: string;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={view !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {view ? (
          <>
            <SheetHeader>
              <SheetTitle>{view.driver.name}</SheetTitle>
              <SheetDescription>
                {view.driver.employeeId}
                {view.driver.phone ? ` · ${view.driver.phone}` : ""}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6">
              <div className="flex items-center justify-between gap-3">
                <DriverStatusBadge status={view.status} />
              </div>
              {view.conflicts.length > 0 ? (
                <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-3">
                  <p className="text-sm font-medium">Schedule conflict</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                    {view.conflicts.map((conflict) => (
                      <li key={`${conflict.code}-${conflict.message}`}>{conflict.message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <section>
                <h3 className="text-sm font-semibold">Assigned trips</h3>
                {view.trips.filter((item) => item.trip.status !== "cancelled").length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">No trips assigned.</p>
                ) : (
                  <ul className="mt-3 grid gap-2">
                    {view.trips
                      .filter((item) => item.trip.status !== "cancelled")
                      .map((item) => (
                        <li key={item.trip.id} className="rounded-md border border-border px-3 py-2 text-sm">
                          <p className="font-medium">
                            {item.trip.departureTime}–{item.trip.arrivalTime} · {item.routeCode}
                          </p>
                          <p className="text-muted-foreground">{item.routeName}</p>
                          <p className="text-muted-foreground">{item.vehicleName}</p>
                          <div className="mt-2">
                            <BookingStatusBadge status={item.trip.status} kind="trip" />
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </section>
              <section>
                <h3 className="text-sm font-semibold">Availability</h3>
                <div className="mt-3">
                  <TimelineLegend />
                  <div className="mt-3">
                    <DriverTimeline model={view.timeline} />
                  </div>
                </div>
              </section>
              <DriverScheduleEditor
                key={`${view.driver.id}-${date}-${view.schedule?.dutyStart ?? "none"}-${view.schedule?.dutyEnd ?? "none"}`}
                view={view}
                date={date}
              />
              <DriverBreakEditor
                key={`${view.driver.id}-${date}-${view.schedule?.breaks.map((item) => item.id).join(",") ?? "none"}`}
                view={view}
                date={date}
              />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
