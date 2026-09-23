import { Button } from "@/components/ui/button";
import type { BookableTrip } from "@/services/booking-service";

import { TripCard } from "./trip-card";

type TripResultsProps = {
  results: BookableTrip[];
  pickupName: string;
  dropoffName: string;
  onSelect: (option: BookableTrip) => void;
  onChangeSearch: () => void;
};

export function TripResults({
  results,
  pickupName,
  dropoffName,
  onSelect,
  onChangeSearch,
}: TripResultsProps) {
  if (results.length === 0) {
    return (
      <section className="mt-6 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
        <h2 className="text-lg font-semibold">No shuttles available</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          No trips match this date, route, and stop pair. Change the search and try again.
        </p>
        <Button type="button" variant="outline" className="mt-5 h-11" onClick={onChangeSearch}>
          Change search
        </Button>
      </section>
    );
  }

  return (
    <section className="mt-6" aria-label="Available shuttles">
      <h2 className="text-base font-semibold">
        {results.length === 1 ? "1 shuttle" : `${results.length} shuttles`}
      </h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {results.map((option) => (
          <TripCard
            key={option.trip.id}
            option={option}
            pickupName={pickupName}
            dropoffName={dropoffName}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
