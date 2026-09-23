"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/time";
import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";

const searchSchema = z
  .object({
    serviceDate: z.string().min(1, "Choose a date."),
    routeId: z.string().min(1, "Choose a route."),
    pickupStopId: z.string().min(1, "Choose a pickup."),
    dropoffStopId: z.string().min(1, "Choose a destination."),
  })
  .superRefine((value, context) => {
    if (
      value.pickupStopId &&
      value.dropoffStopId &&
      value.pickupStopId === value.dropoffStopId
    ) {
      context.addIssue({
        code: "custom",
        path: ["dropoffStopId"],
        message: "Pickup and destination must be different stops.",
      });
    }
  });

export type BookingSearchValues = z.infer<typeof searchSchema>;

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

type BookingSearchFormProps = {
  dates: string[];
  routes: Route[];
  stops: Stop[];
  pending: boolean;
  onRouteChange: (routeId: string) => void;
  onSubmit: (values: BookingSearchValues) => void;
};

export function BookingSearchForm({
  dates,
  routes,
  stops,
  pending,
  onRouteChange,
  onSubmit,
}: BookingSearchFormProps) {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<BookingSearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      serviceDate: "",
      routeId: "",
      pickupStopId: "",
      dropoffStopId: "",
    },
  });

  const [pickupStopId, setPickupStopId] = useState("");
  const pickupIndex = stops.findIndex((stop) => stop.id === pickupStopId);
  const pickupOptions = stops.slice(0, -1);
  const destinationOptions = pickupIndex >= 0 ? stops.slice(pickupIndex + 1) : [];

  return (
    <form
      id="booking-search"
      className="rounded-lg border border-border bg-card p-4 shadow-card sm:p-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="serviceDate" className="text-sm font-medium">
            Date
          </label>
          <select
            id="serviceDate"
            className={fieldClassName}
            disabled={dates.length === 0 || pending}
            {...register("serviceDate")}
          >
            <option value="">Select a date</option>
            {dates.map((date) => (
              <option key={date} value={date}>
                {formatDisplayDate(date)}
              </option>
            ))}
          </select>
          {errors.serviceDate ? (
            <p className="text-sm text-destructive">{errors.serviceDate.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="routeId" className="text-sm font-medium">
            Route
          </label>
          <select
            id="routeId"
            className={fieldClassName}
            disabled={pending}
            {...register("routeId", {
              onChange: (event) => {
                const routeId = String(event.target.value);
                setValue("pickupStopId", "");
                setValue("dropoffStopId", "");
                setPickupStopId("");
                onRouteChange(routeId);
              },
            })}
          >
            <option value="">Select a route</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.code} · {route.name}
              </option>
            ))}
          </select>
          {errors.routeId ? (
            <p className="text-sm text-destructive">{errors.routeId.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pickupStopId" className="text-sm font-medium">
            Pickup
          </label>
          <select
            id="pickupStopId"
            className={fieldClassName}
            disabled={stops.length === 0 || pending}
            {...register("pickupStopId", {
              onChange: (event) => {
                const nextPickup = String(event.target.value);
                setPickupStopId(nextPickup);
                const index = stops.findIndex((stop) => stop.id === nextPickup);
                const allowed = index >= 0 ? stops.slice(index + 1) : [];
                const currentDropoff = getValues("dropoffStopId");
                if (!allowed.some((stop) => stop.id === currentDropoff)) {
                  setValue("dropoffStopId", "");
                }
              },
            })}
          >
            <option value="">Select a pickup</option>
            {pickupOptions.map((stop) => (
              <option key={stop.id} value={stop.id}>
                {stop.name}
              </option>
            ))}
          </select>
          {errors.pickupStopId ? (
            <p className="text-sm text-destructive">{errors.pickupStopId.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="dropoffStopId" className="text-sm font-medium">
            Destination
          </label>
          <select
            id="dropoffStopId"
            className={fieldClassName}
            disabled={destinationOptions.length === 0 || pending}
            {...register("dropoffStopId")}
          >
            <option value="">Select a destination</option>
            {destinationOptions.map((stop) => (
              <option key={stop.id} value={stop.id}>
                {stop.name}
              </option>
            ))}
          </select>
          {errors.dropoffStopId ? (
            <p className="text-sm text-destructive">{errors.dropoffStopId.message}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <Button type="submit" className="h-11 w-full sm:w-auto" disabled={pending}>
          {pending ? "Finding shuttles..." : "Find shuttles"}
        </Button>
      </div>
    </form>
  );
}
