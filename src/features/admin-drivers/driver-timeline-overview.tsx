import { driverStatusLabel } from "./driver-data";
import type { DriverDayView } from "./driver-types";
import { TimeAxis, TimelineLegend, TimelineTrack } from "./timeline-view";

export function DriverTimelineOverview({
  views,
  selectedId,
  onSelect,
}: {
  views: DriverDayView[];
  selectedId: string | null;
  onSelect: (driverId: string) => void;
}) {
  const model = views[0]?.timeline;
  if (!model) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Availability timeline</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared window for this date. A trip overrides a break, and a break overrides open duty.
          </p>
        </div>
        <TimelineLegend />
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[44rem]">
          <div className="grid grid-cols-[9rem_1fr] gap-2">
            <span className="sr-only">Time</span>
            <TimeAxis model={model} />
          </div>
          <ul className="mt-2 grid gap-2">
            {views.map((view) => (
              <li key={view.driver.id} className="grid grid-cols-[9rem_1fr] items-center gap-2">
                <button
                  type="button"
                  className={`truncate rounded-md px-2 py-1 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedId === view.driver.id ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"}`}
                  onClick={() => onSelect(view.driver.id)}
                >
                  {view.driver.name}
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    {driverStatusLabel[view.status]}
                    {view.conflicts.length > 0 ? " · Schedule conflict" : ""}
                  </span>
                </button>
                <TimelineTrack model={model} segments={view.timeline.merged} empty="Off duty" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
