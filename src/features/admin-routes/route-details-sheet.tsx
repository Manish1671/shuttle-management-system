"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useWriteGuard } from "@/lib/use-write-guard";
import { routeService } from "@/services/route-service";
import type { Stop } from "@/types/stop";

import { RouteForm } from "./route-form";
import { RouteStopEditor } from "./route-stop-editor";
import type { RouteViewModel } from "./route-types";

export function RouteDetailsSheet({
  view,
  stops,
  onOpenChange,
}: {
  view: RouteViewModel | null;
  stops: readonly Stop[];
  onOpenChange: (open: boolean) => void;
}) {
  const [stopError, setStopError] = useState<string | null>(null);
  const [activeError, setActiveError] = useState<string | null>(null);
  const { pending, run } = useWriteGuard();

  function updateStops(stopIds: string[]) {
    if (!view) {
      return;
    }
    run(() => {
      setStopError(null);
      const result = routeService.saveRoute({ ...view.route, stopIds });
      if (!result.ok) {
        setStopError(result.errors[0]?.message ?? "Unable to update the stop order.");
      }
    });
  }

  function toggleActive() {
    if (!view) {
      return;
    }
    run(() => {
      setActiveError(null);
      const result = routeService.setActive(view.route.id, !view.route.active);
      if (!result.ok) {
        setActiveError(result.errors[0]?.message ?? "Unable to update this route.");
      }
    });
  }

  return (
    <Sheet open={view !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {view ? (
          <>
            <SheetHeader>
              <SheetTitle>{view.route.name}</SheetTitle>
              <SheetDescription>
                {view.route.code} · {view.route.active ? "Active" : "Inactive"}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Today&apos;s trips</dt>
                  <dd className="mt-1 font-medium">{view.todayTrips === 0 ? "No trips scheduled today." : view.todayTrips}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Upcoming trips</dt>
                  <dd className="mt-1 font-medium">{view.upcomingTrips}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Today&apos;s bookings</dt>
                  <dd className="mt-1 font-medium">{view.todayBookings === 0 ? "No bookings today." : view.todayBookings}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Utilization</dt>
                  <dd className="mt-1 font-medium">{view.utilizationLabel}</dd>
                </div>
              </dl>
              {view.route.description ? <p className="text-sm text-muted-foreground">{view.route.description}</p> : null}
              <div>
                <Button type="button" variant="outline" disabled={pending} onClick={toggleActive}>
                  {view.route.active ? "Deactivate route" : "Activate route"}
                </Button>
                {activeError ? (
                  <p role="alert" className="mt-2 text-sm text-destructive">
                    {activeError}
                  </p>
                ) : null}
              </div>
              <section>
                <h3 className="text-sm font-semibold">Ordered stops</h3>
                <div className="mt-3">
                  <RouteStopEditor
                    stopIds={view.route.stopIds}
                    stops={stops}
                    onChange={updateStops}
                    error={stopError}
                  />
                </div>
              </section>
              <section>
                <h3 className="text-sm font-semibold">Route details</h3>
                <div className="mt-3">
                  <RouteForm
                    key={view.route.id}
                    draft={view.route}
                    stops={stops}
                    submitLabel="Save route"
                    manageStops={false}
                    onSaved={() => undefined}
                  />
                </div>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
