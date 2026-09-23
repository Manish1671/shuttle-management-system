"use client";

import { useState, useSyncExternalStore } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { useCurrentUser } from "@/features/auth/current-user-provider";
import { bookingService, type BookableTrip } from "@/services/booking-service";
import { routeService } from "@/services/route-service";
import type { Stop } from "@/types/stop";
import type { Booking } from "@/types/booking";

import { BookingReview, type BookingDraftView } from "./booking-review";
import {
  getBookingCatalog,
  getServerBookingCatalog,
  subscribeBookingCatalog,
} from "./booking-catalog";
import { BookingSearchForm, type BookingSearchValues } from "./booking-search-form";
import { BookingSuccess } from "./booking-success";
import { TripResults } from "./trip-results";

type Step = "search" | "review" | "success";

type SearchState = {
  values: BookingSearchValues;
  pickupName: string;
  dropoffName: string;
  results: BookableTrip[];
};

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export function BookShuttleFlow() {
  const catalog = useSyncExternalStore(
    subscribeBookingCatalog,
    getBookingCatalog,
    getServerBookingCatalog,
  );
  const { user } = useCurrentUser();
  const [stops, setStops] = useState<Stop[]>([]);
  const [step, setStep] = useState<Step>("search");
  const [formKey, setFormKey] = useState(0);
  const [pending, setPending] = useState<"search" | "confirm" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<SearchState | null>(null);
  const [draft, setDraft] = useState<BookingDraftView | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  function handleRouteChange(routeId: string) {
    setStops(routeId ? routeService.getOrderedStops(routeId).filter((stop) => stop.active) : []);
    setSearch(null);
  }

  async function handleSearch(values: BookingSearchValues) {
    if (pending) {
      return;
    }

    setPending("search");
    setError(null);
    await wait(200);

    const results = bookingService.searchBookableTrips(values.routeId, values.serviceDate);
    const pickupName = stops.find((stop) => stop.id === values.pickupStopId)?.name ?? "Pickup";
    const dropoffName =
      stops.find((stop) => stop.id === values.dropoffStopId)?.name ?? "Destination";

    setSearch({ values, pickupName, dropoffName, results });
    setStep("search");
    setPending(null);
  }

  function handleSelect(option: BookableTrip) {
    if (!user || !search) {
      return;
    }

    setDraft({
      passengerName: user.name,
      option,
      pickupName: search.pickupName,
      dropoffName: search.dropoffName,
      pickupStopId: search.values.pickupStopId,
      dropoffStopId: search.values.dropoffStopId,
    });
    setError(null);
    setStep("review");
  }

  async function handleConfirm() {
    if (!user || !draft || pending) {
      return;
    }

    setPending("confirm");
    setError(null);
    await wait(200);

    const result = bookingService.createBooking({
      userId: user.id,
      tripId: draft.option.trip.id,
      pickupStopId: draft.pickupStopId,
      dropoffStopId: draft.dropoffStopId,
    });

    if (!result.ok) {
      setError(result.errors[0]?.message ?? "Unable to complete booking.");
      setPending(null);
      return;
    }

    setBooking(result.booking);
    setStep("success");
    setPending(null);
  }

  function handleBookAnother() {
    setFormKey((value) => value + 1);
    setStops([]);
    setSearch(null);
    setDraft(null);
    setBooking(null);
    setError(null);
    setStep("search");
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Book a Shuttle"
        description="Find and reserve a campus shuttle for your journey."
      />

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <p className="font-medium">Unable to complete booking</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}

      {!catalog.ready ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading shuttle routes...</p>
      ) : null}

      {catalog.ready && catalog.dates.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No upcoming shuttle dates are available.
        </p>
      ) : null}

      {catalog.ready ? (
        <div className={step === "search" ? "mt-6" : "hidden"}>
          <BookingSearchForm
            key={formKey}
            dates={catalog.dates}
            routes={catalog.routes}
            stops={stops}
            pending={pending === "search"}
            onRouteChange={handleRouteChange}
            onSubmit={handleSearch}
          />
          {search && step === "search" ? (
            <TripResults
              results={search.results}
              pickupName={search.pickupName}
              dropoffName={search.dropoffName}
              onSelect={handleSelect}
              onChangeSearch={() => {
                document.getElementById("serviceDate")?.focus();
              }}
            />
          ) : null}
        </div>
      ) : null}

      {step === "review" && draft ? (
        <div className="mt-6">
          <BookingReview
            draft={draft}
            pending={pending === "confirm"}
            onBack={() => {
              setError(null);
              setStep("search");
            }}
            onConfirm={() => {
              void handleConfirm();
            }}
          />
        </div>
      ) : null}

      {step === "success" && booking && draft ? (
        <div className="mt-6">
          <BookingSuccess
            booking={booking}
            pickupName={draft.pickupName}
            dropoffName={draft.dropoffName}
            serviceDate={draft.option.trip.serviceDate}
            departureTime={draft.option.trip.departureTime}
            onBookAnother={handleBookAnother}
          />
        </div>
      ) : null}
    </div>
  );
}
