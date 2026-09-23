"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/current-user-provider";
import { BookingCard } from "@/features/bookings/booking-card";
import { BookingDetailsSheet } from "@/features/bookings/booking-details-sheet";
import { useRiderBookings } from "@/features/bookings/use-rider-bookings";
import { tripSortKey, type BookingViewModel } from "@/services/booking-view";

type HistoryFilter = "all" | "completed" | "cancelled";

const filters: { id: HistoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function isCompleted(view: BookingViewModel): boolean {
  return view.booking.status === "completed" || view.trip?.status === "completed";
}

export function TripHistory() {
  const { user } = useCurrentUser();
  const data = useRiderBookings(user?.id);
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [selected, setSelected] = useState<BookingViewModel | null>(null);

  const history = [...data.past, ...data.cancelled].sort((left, right) =>
    tripSortKey(right).localeCompare(tripSortKey(left)),
  );
  const visible = history.filter((view) => {
    if (filter === "cancelled") {
      return view.booking.status === "cancelled";
    }

    if (filter === "completed") {
      return isCompleted(view);
    }

    return true;
  });

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Trip History"
        description="Completed and cancelled campus shuttle trips."
      />

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter trip history">
        {filters.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={filter === item.id ? "default" : "outline"}
            className="h-11"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {data.status === "loading" ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading trip history...</p>
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

      {data.status === "ready" && visible.length === 0 ? (
        <section className="mt-6 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
          <h2 className="text-lg font-semibold">No trip history yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Your completed and cancelled trips will appear here.
          </p>
        </section>
      ) : null}

      {data.status === "ready" && visible.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {visible.map((view) => (
            <BookingCard key={view.booking.id} view={view} onView={setSelected} />
          ))}
        </div>
      ) : null}

      <BookingDetailsSheet
        view={selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      />
    </div>
  );
}
