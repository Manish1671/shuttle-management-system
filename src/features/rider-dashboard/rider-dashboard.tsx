"use client";

import Link from "next/link";
import { History, Ticket, ClipboardList } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/features/bookings/booking-status-badge";
import { useRiderBookings } from "@/features/bookings/use-rider-bookings";
import { roleLabel } from "@/features/auth/demo-users";
import { useCurrentUser } from "@/features/auth/current-user-provider";
import { formatDisplayDate } from "@/lib/time";
import { tripSortKey, type BookingViewModel } from "@/services/booking-view";

const recentLimit = 3;

export function RiderDashboard() {
  const { user } = useCurrentUser();
  const data = useRiderBookings(user?.id);
  const nextRide = data.upcoming[0] ?? null;
  const recent = [...data.past, ...data.cancelled]
    .sort((left, right) => tripSortKey(right).localeCompare(tripSortKey(left)))
    .slice(0, recentLimit);
  const firstName = user?.name.split(" ")[0] ?? "Rider";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title={user ? `Welcome back, ${firstName}` : "Dashboard"}
        description={user ? `${roleLabel(user)} Rider` : "Your campus shuttle rides."}
      />

      {data.status === "loading" ? (
        <p className="mt-8 text-sm text-muted-foreground" role="status">
          Loading your rides…
        </p>
      ) : null}

      {data.status === "error" ? (
        <div role="alert" className="mt-6 rounded-lg border border-destructive/30 bg-card p-6">
          <h2 className="text-base font-semibold">Unable to load your rides</h2>
          <p className="mt-2 text-sm text-muted-foreground">{data.message}</p>
          <Button type="button" className="mt-4 h-11" onClick={data.retry}>
            Try again
          </Button>
        </div>
      ) : null}

      {data.status === "ready" ? (
        <>
          <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Booking summary">
            <Summary label="Upcoming" value={data.upcoming.length} />
            <Summary label="Completed" value={data.past.length} />
            <Summary label="Cancelled" value={data.cancelled.length} />
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Quick actions">
            <Action href="/book" label="Book Shuttle" icon={Ticket} />
            <Action href="/bookings" label="My Bookings" icon={ClipboardList} />
            <Action href="/history" label="Trip History" icon={History} />
          </section>

          <section className="mt-6 rounded-lg border border-border bg-card p-4 shadow-card sm:p-6">
            <h2 className="text-base font-semibold">Next ride</h2>
            {nextRide ? (
              <NextRide view={nextRide} />
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-border px-4 py-8">
                <p className="text-sm font-medium">You don&apos;t have an upcoming shuttle ride.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Book a shuttle to plan your next campus trip.
                </p>
                <Button asChild className="mt-4 h-11">
                  <Link href="/book">Book Shuttle</Link>
                </Button>
              </div>
            )}
          </section>

          <section className="mt-4 rounded-lg border border-border bg-card p-4 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Recent trips</h2>
              <Link href="/history" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                Trip History
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No completed or cancelled trips yet.</p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {recent.map((view) => (
                  <li key={view.booking.id} className="rounded-md border border-border px-3 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-medium">
                        {view.trip ? formatDisplayDate(view.trip.serviceDate) : "Date unavailable"}
                      </p>
                      <BookingStatusBadge status={view.booking.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {view.route?.code ?? "Route"} · {view.route?.name ?? "Unavailable"}
                    </p>
                    <p className="mt-1 text-sm">
                      {view.pickupStop?.name ?? "Pickup"} → {view.dropoffStop?.name ?? "Destination"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-card">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}

function Action({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Ticket;
}) {
  return (
    <Link
      href={href}
      className="flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}

function NextRide({ view }: { view: BookingViewModel }) {
  const { booking, trip } = view;
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Booking {booking.id}</p>
          <p className="mt-1 text-lg font-semibold">
            {view.route?.name ?? "Route unavailable"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">{view.route?.code}</span>
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Pickup</dt>
          <dd className="mt-1 font-medium">{view.pickupStop?.name ?? "Pickup"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Destination</dt>
          <dd className="mt-1 font-medium">{view.dropoffStop?.name ?? "Destination"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Date</dt>
          <dd className="mt-1 font-medium">{trip ? formatDisplayDate(trip.serviceDate) : "Unavailable"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Departure</dt>
          <dd className="mt-1 font-medium">
            {trip?.departureTime ?? "--:--"}
            {trip?.arrivalTime ? ` – ${trip.arrivalTime}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Driver</dt>
          <dd className="mt-1 font-medium">{view.driver?.name ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Vehicle</dt>
          <dd className="mt-1 font-medium">{view.vehicle?.displayName ?? "Unassigned"}</dd>
        </div>
      </dl>
      <Button asChild className="mt-4 h-11" variant="outline">
        <Link href="/bookings">View booking</Link>
      </Button>
    </div>
  );
}
