import { formatMinutes } from "@/lib/time";

import type { TimelineModel, TimelineSegment } from "./driver-types";

const segmentClass: Record<TimelineSegment["kind"], string> = {
  off_duty: "border-border bg-muted text-muted-foreground",
  duty: "border-primary/40 bg-primary/15 text-foreground",
  available: "border-success/40 bg-success/15 text-foreground",
  on_break: "border-warning/50 bg-warning/15 text-foreground",
  on_trip: "border-info/40 bg-info/15 text-foreground",
};

export function TimelineLegend() {
  const items: { kind: TimelineSegment["kind"]; label: string }[] = [
    { kind: "duty", label: "Duty" },
    { kind: "available", label: "Available" },
    { kind: "on_trip", label: "On trip" },
    { kind: "on_break", label: "On break" },
    { kind: "off_duty", label: "Off duty" },
    { kind: "on_trip", label: "Conflict" },
  ];

  return (
    <ul className="flex flex-wrap gap-3 text-xs">
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <span
            className={`size-3 rounded-sm border ${segmentClass[item.kind]} ${item.label === "Conflict" ? "ring-2 ring-destructive" : ""}`}
            aria-hidden="true"
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function DriverTimeline({ model }: { model: TimelineModel }) {
  return (
    <div className="min-w-0 max-w-full overflow-x-auto">
      <p className="mb-2 text-xs text-muted-foreground md:hidden">Scroll sideways to see the full day.</p>
      <div className="min-w-[44rem]">
        <div className="grid grid-cols-[5.5rem_1fr] gap-2">
          <span className="sr-only">Time</span>
          <TimeAxis model={model} />
        </div>
        <div className="mt-2 grid gap-2">
          {model.lanes.map((lane) => (
            <div key={lane.id} className="grid grid-cols-[5.5rem_1fr] items-center gap-2">
              <p className="text-xs font-medium">{lane.label}</p>
              <TimelineTrack model={model} segments={lane.segments} empty={lane.empty} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TimeAxis({ model }: { model: TimelineModel }) {
  const span = model.end - model.start;
  const first = model.hours[0];
  const last = model.hours[model.hours.length - 1];
  return (
    <div className="relative h-5" aria-hidden="true">
      {model.hours.map((hour) => {
        const atStart = hour === first;
        const atEnd = hour === last && !atStart;
        return (
          <span
            key={hour}
            className={`absolute top-0 text-[11px] text-muted-foreground ${atStart || atEnd ? "" : "-translate-x-1/2"}`}
            style={atEnd ? { right: 0 } : { left: atStart ? 0 : `${((hour - model.start) / span) * 100}%` }}
          >
            {formatMinutes(hour).slice(0, 2)}
          </span>
        );
      })}
    </div>
  );
}

export function TimelineTrack({
  model,
  segments,
  empty,
}: {
  model: TimelineModel;
  segments: TimelineSegment[];
  empty: string;
}) {
  const span = model.end - model.start;
  return (
    <div className="relative h-8 rounded-md border border-dashed border-border bg-muted/40">
      {segments.length === 0 ? (
        <p className="px-2 py-1.5 text-xs text-muted-foreground">{empty}</p>
      ) : (
        segments.map((segment) => {
          const width = ((segment.end - segment.start) / span) * 100;
          return (
            <div
              key={segment.id}
              className={`absolute top-1 bottom-1 flex items-center overflow-hidden rounded-sm border px-1 text-[11px] font-medium ${segmentClass[segment.kind]} ${segment.conflict ? "ring-2 ring-destructive" : ""}`}
              style={{
                left: `${((segment.start - model.start) / span) * 100}%`,
                width: `${width}%`,
              }}
              title={segment.label}
            >
              <span className="truncate">{segment.conflict ? "Conflict" : segment.label}</span>
            </div>
          );
        })
      )}
    </div>
  );
}
