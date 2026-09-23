"use client";

import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/current-user-provider";
import { bookingService } from "@/services/booking-service";
import type { BookingViewModel } from "@/services/booking-view";

import { BookingCard } from "./booking-card";
import { BookingDetailsSheet } from "./booking-details-sheet";
import { CancelBookingDialog } from "./cancel-booking-dialog";
import { useRiderBookings } from "./use-rider-bookings";

function BookingSection({
  title,
  description,
  views,
  onView,
  onCancel,
}: {
  title: string;
  description: string;
  views: BookingViewModel[];
  onView: (view: BookingViewModel) => void;
  onCancel?: (view: BookingViewModel) => void;
}) {
  if (views.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {views.map((view) => (
          <BookingCard
            key={view.booking.id}
            view={view}
            onView={onView}
            onCancel={onCancel}
          />
        ))}
      </div>
    </section>
  );
}

export function MyBookings() {
  const { user } = useCurrentUser();
  const data = useRiderBookings(user?.id);
  const [selected, setSelected] = useState<BookingViewModel | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingViewModel | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function confirmCancel() {
    if (!user || !cancelTarget || pending) {
      return;
    }

    setPending(true);
    setCancelError(null);
    const result = bookingService.cancelBooking(cancelTarget.booking.id, user.id);
    setPending(false);

    if (!result.ok) {
      setCancelError(result.errors[0]?.message ?? "Unable to cancel this booking.");
      return;
    }

    setCancelTarget(null);
    setSelected(null);
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="My Bookings"
        description="View and manage your upcoming campus shuttle reservations."
      />

      {data.status === "loading" ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading bookings...</p>
      ) : null}

      {data.status === "error" ? (
        <div role="alert" className="mt-6 rounded-lg border border-destructive/30 bg-card p-6">
          <h2 className="text-base font-semibold">Unable to load bookings</h2>
          <p className="mt-2 text-sm text-muted-foreground">{data.message}</p>
          <Button type="button" className="mt-4 h-11" onClick={data.retry}>
            Try again
          </Button>
        </div>
      ) : null}

      {data.status === "ready" && data.upcoming.length === 0 ? (
        <section className="mt-6 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
          <h2 className="text-lg font-semibold">No upcoming bookings</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            You don&apos;t have any upcoming shuttle reservations.
          </p>
          <Button asChild className="mt-5 h-11">
            <Link href="/book">Book a shuttle</Link>
          </Button>
        </section>
      ) : null}

      {data.status === "ready" ? (
        <>
          <BookingSection
            title="Upcoming"
            description="Reservations you can still use."
            views={data.upcoming}
            onView={setSelected}
            onCancel={(view) => {
              setCancelError(null);
              setCancelTarget(view);
            }}
          />
          <BookingSection
            title="Past / Completed"
            description="Trips that have already finished."
            views={data.past}
            onView={setSelected}
          />
          <BookingSection
            title="Cancelled"
            description="Reservations you cancelled. The seat was released."
            views={data.cancelled}
            onView={setSelected}
          />
        </>
      ) : null}

      <BookingDetailsSheet
        view={selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
        onCancel={(view) => {
          setCancelError(null);
          setCancelTarget(view);
        }}
      />
      <CancelBookingDialog
        bookingId={cancelTarget?.booking.id ?? null}
        pending={pending}
        error={cancelError}
        onOpenChange={(open) => {
          if (!open && !pending) {
            setCancelTarget(null);
            setCancelError(null);
          }
        }}
        onConfirm={() => {
          void confirmCancel();
        }}
      />
    </div>
  );
}
