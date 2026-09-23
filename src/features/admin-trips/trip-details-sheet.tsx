"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BookingStatusBadge } from "@/features/bookings/booking-status-badge";
import { formatDisplayDate } from "@/lib/time";
import { useWriteGuard } from "@/lib/use-write-guard";
import { nextTripStatuses } from "@/lib/validation/domain";
import { tripService } from "@/services/trip-service";
import type { TripStatus } from "@/types/trip";

import type { TripViewModel } from "./trip-data";

const statusLabel: Record<TripStatus, string> = {
  scheduled: "Scheduled",
  boarding: "Boarding",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function TripDetailsSheet({
  view,
  onOpenChange,
  onEdit,
}: {
  view: TripViewModel | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (tripId: string) => void;
}) {
  const [statusError, setStatusError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { pending, run } = useWriteGuard();

  function changeStatus(status: TripStatus) {
    if (!view) {
      return;
    }
    run(() => {
      setStatusError(null);
      const result = tripService.setTripStatus(view.trip.id, status);
      if (!result.ok) {
        setStatusError(result.errors[0]?.message ?? "Unable to update this trip.");
        return;
      }
      setConfirmCancel(false);
    });
  }

  const next = view ? nextTripStatuses(view.trip.status) : [];

  return (
    <Sheet
      open={view !== null}
      onOpenChange={(open) => {
        if (!open) {
          setConfirmCancel(false);
          setStatusError(null);
        }
        onOpenChange(open);
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {view ? (
          <>
            <SheetHeader>
              <SheetTitle>{view.route?.name ?? "Trip"}</SheetTitle>
              <SheetDescription>
                {view.trip.id} · {formatDisplayDate(view.trip.serviceDate)}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6">
              <div className="flex items-center gap-2">
                <BookingStatusBadge status={view.trip.status} kind="trip" />
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Departure" value={view.trip.departureTime} />
                <Field label="Arrival" value={view.trip.arrivalTime} />
                <Field label="Route" value={view.route ? `${view.route.name} · ${view.route.code}` : "Unknown route"} />
                <Field label="Driver" value={view.driver ? `${view.driver.name} · ${view.driver.employeeId}` : "Unassigned"} />
                <Field label="Contact" value={view.driver?.phone ?? "—"} />
                <Field
                  label="Vehicle"
                  value={
                    view.vehicle
                      ? `${view.vehicle.registrationNumber} · ${view.vehicle.displayName}`
                      : "Unassigned"
                  }
                />
                <Field label="Vehicle status" value={view.vehicle?.status ?? "—"} />
                <Field label="Capacity" value={String(view.trip.capacity)} />
                <Field label="Booked" value={String(view.occupied)} />
                <Field label="Available" value={String(view.availableSeats)} />
                <Field label="Occupancy" value={view.utilizationLabel} />
              </dl>
              <section>
                <h3 className="text-sm font-semibold">Ordered stops</h3>
                {view.stops.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">This route has no stops configured.</p>
                ) : (
                  <ol className="mt-2 grid gap-1 text-sm">
                    {view.stops.map((stop, index) => (
                      <li key={stop.id}>
                        {index + 1}. {stop.name}
                      </li>
                    ))}
                  </ol>
                )}
              </section>
              <section>
                <h3 className="text-sm font-semibold">Bookings</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {view.occupied === 0
                    ? "No bookings on this trip."
                    : `${view.occupied} non-cancelled booking${view.occupied === 1 ? "" : "s"}.`}
                </p>
                {view.trip.status === "cancelled" && view.occupied > 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    These bookings stay on the cancelled trip.
                  </p>
                ) : null}
                <Button className="mt-3" variant="outline" size="sm" asChild>
                  <Link href="/admin/bookings">View bookings</Link>
                </Button>
              </section>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" disabled={pending} onClick={() => onEdit(view.trip.id)}>
                  Edit trip
                </Button>
                {next
                  .filter((status) => status !== "cancelled")
                  .map((status) => (
                    <Button key={status} type="button" variant="outline" disabled={pending} onClick={() => changeStatus(status)}>
                      Mark {statusLabel[status].toLowerCase()}
                    </Button>
                  ))}
                {next.includes("cancelled") ? (
                  <Button type="button" variant="outline" disabled={pending} onClick={() => setConfirmCancel(true)}>
                    Cancel trip
                  </Button>
                ) : null}
              </div>
              {confirmCancel ? (
                <div className="rounded-md border border-border p-3 text-sm">
                  <p>
                    Cancelling keeps this trip and its {view.occupied} booking
                    {view.occupied === 1 ? "" : "s"}. Bookings are not deleted.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button type="button" variant="destructive" disabled={pending} onClick={() => changeStatus("cancelled")}>
                      Confirm cancellation
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setConfirmCancel(false)}>
                      Keep trip
                    </Button>
                  </div>
                </div>
              ) : null}
              {statusError ? (
                <p role="alert" className="text-sm text-destructive">
                  {statusError}
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
