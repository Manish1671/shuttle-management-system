"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useWriteGuard } from "@/lib/use-write-guard";
import { scheduleService } from "@/services/schedule-service";

import type { DriverDayView } from "./driver-types";

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DriverScheduleEditor({ view, date }: { view: DriverDayView; date: string }) {
  const [dutyStart, setDutyStart] = useState(view.schedule?.dutyStart ?? "07:00");
  const [dutyEnd, setDutyEnd] = useState(view.schedule?.dutyEnd ?? "16:00");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { pending, run } = useWriteGuard();

  function save() {
    run(() => {
      setError(null);
      setSaved(false);
      const result = scheduleService.saveDuty(view.driver.id, date, dutyStart, dutyEnd);
      if (!result.ok) {
        setError(result.errors[0]?.message ?? "Unable to save this schedule.");
        return;
      }
      setSaved(true);
    });
  }

  return (
    <section>
      <h3 className="text-sm font-semibold">Duty schedule</h3>
      {view.schedule ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {view.schedule.dutyStart}–{view.schedule.dutyEnd}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">No schedule for this date.</p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="mb-1.5 block font-medium">Duty start</span>
          <input className={fieldClassName} type="time" value={dutyStart} onChange={(event) => setDutyStart(event.target.value)} />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-medium">Duty end</span>
          <input className={fieldClassName} type="time" value={dutyEnd} onChange={(event) => setDutyEnd(event.target.value)} />
        </label>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Duty saved.
        </p>
      ) : null}
      <Button type="button" className="mt-3" disabled={pending} onClick={save}>
        {pending ? "Saving schedule..." : view.schedule ? "Save duty" : "Create duty"}
      </Button>
    </section>
  );
}
