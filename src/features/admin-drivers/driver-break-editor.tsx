"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useWriteGuard } from "@/lib/use-write-guard";
import { scheduleService } from "@/services/schedule-service";
import type { BreakReason, DriverBreak } from "@/types/schedule";

import type { DriverDayView } from "./driver-types";

const fieldClassName =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const reasons: { value: BreakReason; label: string }[] = [
  { value: "meal", label: "Meal" },
  { value: "rest", label: "Rest" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
];

export function DriverBreakEditor({ view, date }: { view: DriverDayView; date: string }) {
  if (!view.schedule) {
    return (
      <section>
        <h3 className="text-sm font-semibold">Breaks</h3>
        <p className="mt-1 text-sm text-muted-foreground">Save a duty schedule before adding a break.</p>
      </section>
    );
  }

  return (
    <section>
      <h3 className="text-sm font-semibold">Breaks</h3>
      {view.schedule.breaks.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">No breaks scheduled.</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {view.schedule.breaks.map((item) => (
            <BreakRow key={item.id} item={item} driverId={view.driver.id} date={date} />
          ))}
        </ul>
      )}
      <AddBreak driverId={view.driver.id} date={date} />
    </section>
  );
}

function BreakRow({ item, driverId, date }: { item: DriverBreak; driverId: string; date: string }) {
  const [startTime, setStartTime] = useState(item.startTime);
  const [endTime, setEndTime] = useState(item.endTime);
  const [reason, setReason] = useState<BreakReason>(item.reason);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useWriteGuard();

  function save() {
    run(() => {
      setError(null);
      const result = scheduleService.updateBreak(driverId, date, item.id, { startTime, endTime, reason });
      if (!result.ok) {
        setError(result.errors[0]?.message ?? "Unable to update this break.");
      }
    });
  }

  function remove() {
    run(() => {
      setError(null);
      const result = scheduleService.removeBreak(driverId, date, item.id);
      if (!result.ok) {
        setError(result.errors[0]?.message ?? "Unable to remove this break.");
      }
    });
  }

  return (
    <li className="rounded-md border border-border p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label className="text-xs">
          Start
          <input className={`${fieldClassName} mt-1`} type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
        </label>
        <label className="text-xs">
          End
          <input className={`${fieldClassName} mt-1`} type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
        </label>
        <label className="text-xs">
          Reason
          <select className={`${fieldClassName} mt-1`} value={reason} onChange={(event) => setReason(event.target.value as BreakReason)}>
            {reasons.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={save}>
          Save break
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={remove}>
          Remove break
        </Button>
      </div>
    </li>
  );
}

function AddBreak({ driverId, date }: { driverId: string; date: string }) {
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:30");
  const [reason, setReason] = useState<BreakReason>("meal");
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useWriteGuard();

  function add() {
    run(() => {
      setError(null);
      const result = scheduleService.addBreak(driverId, date, startTime, endTime, reason);
      if (!result.ok) {
        setError(result.errors[0]?.message ?? "Unable to add this break.");
      }
    });
  }

  return (
    <div className="mt-3 rounded-md border border-dashed border-border p-3">
      <p className="text-sm font-medium">Add break</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label className="text-xs">
          Start
          <input className={`${fieldClassName} mt-1`} type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
        </label>
        <label className="text-xs">
          End
          <input className={`${fieldClassName} mt-1`} type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
        </label>
        <label className="text-xs">
          Reason
          <select className={`${fieldClassName} mt-1`} value={reason} onChange={(event) => setReason(event.target.value as BreakReason)}>
            {reasons.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="button" size="sm" className="mt-3" variant="outline" disabled={pending} onClick={add}>
        Add break
      </Button>
    </div>
  );
}
