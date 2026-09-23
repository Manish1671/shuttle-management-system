"use client";

import { useMemo, useState } from "react";

import { useWriteGuard } from "@/lib/use-write-guard";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { bookingService } from "@/services/booking-service";

import { AdminBookingDetailsSheet } from "./admin-booking-details-sheet";
import { AdminCancelBookingDialog } from "./admin-cancel-booking-dialog";
import { adminBookingMetrics, filterAdminBookings } from "./admin-bookings-data";
import { defaultBookingFilters, type AdminBookingFilters, type AdminBookingRow } from "./admin-bookings-types";
import { BookingFilters } from "./booking-filters";
import { BookingMobileList } from "./booking-mobile-card";
import { BookingTable } from "./booking-table";
import { useAdminBookings } from "./use-admin-bookings";

const cards = [
  { id: "total", label: "Total bookings", hint: "Every reservation on record" },
  { id: "confirmed", label: "Confirmed", hint: "Does not include cancelled" },
  { id: "cancelled", label: "Cancelled", hint: "Kept in the booking history" },
  { id: "today", label: "Today's bookings", hint: "By trip date, excluding cancelled" },
] as const;

export function AdminBookings() {
  const data = useAdminBookings();
  const [filters, setFilters] = useState<AdminBookingFilters>(defaultBookingFilters);
  const [selected, setSelected] = useState<AdminBookingRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AdminBookingRow | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const { pending, run } = useWriteGuard();
  const [notice, setNotice] = useState<string | null>(null);

  const metrics = useMemo(() => adminBookingMetrics(data.rows), [data.rows]);
  const visible = useMemo(
    () => filterAdminBookings(data.rows, filters),
    [data.rows, filters],
  );

  function confirmCancel() {
    if (!cancelTarget) {
      return;
    }

    run(() => {
      setCancelError(null);
      const result = bookingService.cancelBookingForAdmin(cancelTarget.view.booking.id);
      if (!result.ok) {
        setCancelError(result.errors[0]?.message ?? "Unable to cancel this booking.");
        return;
      }

      setCancelTarget(null);
      setSelected(null);
      setNotice("Booking cancelled successfully.");
    });
  }

  if (data.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          title="Booking Management"
          description="View and manage shuttle bookings across campus routes."
        />
        <p className="mt-8 text-sm text-muted-foreground" role="status">
          Loading bookings…
        </p>
      </div>
    );
  }

  if (data.status === "error") {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          title="Booking Management"
          description="View and manage shuttle bookings across campus routes."
        />
        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-card" role="alert">
          <p className="text-sm font-medium">Unable to load bookings.</p>
          <p className="mt-1 text-sm text-muted-foreground">Please try again.</p>
          <Button className="mt-4" type="button" onClick={data.retry}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const values = {
    total: metrics.total,
    confirmed: metrics.confirmed,
    cancelled: metrics.cancelled,
    today: metrics.today,
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Booking Management"
        description="View and manage shuttle bookings across campus routes."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{values[card.id]}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.hint}</p>
          </article>
        ))}
      </div>

      {notice ? (
        <p className="mt-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success" role="status">
          {notice}
        </p>
      ) : null}

      <div className="mt-6 rounded-lg border border-border bg-card p-4 shadow-card">
        <BookingFilters filters={filters} routes={data.routes} onChange={setFilters} />
        <div className="mt-4">
          {data.rows.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-4 py-8">
              <p className="text-sm font-medium">No bookings found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Shuttle reservations will appear here once riders book a trip.
              </p>
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-4 py-8">
              <p className="text-sm font-medium">No bookings found</p>
              <p className="mt-1 text-sm text-muted-foreground">No bookings match your current filters.</p>
            </div>
          ) : (
            <>
              <BookingTable rows={visible} onView={setSelected} />
              <BookingMobileList rows={visible} onView={setSelected} />
            </>
          )}
        </div>
      </div>

      <AdminBookingDetailsSheet
        row={selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
        onCancel={(row) => {
          setCancelError(null);
          setCancelTarget(row);
        }}
      />
      <AdminCancelBookingDialog
        bookingId={cancelTarget?.view.booking.id ?? null}
        pending={pending}
        error={cancelError}
        onOpenChange={(open) => {
          if (!open && !pending) {
            setCancelTarget(null);
            setCancelError(null);
          }
        }}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
