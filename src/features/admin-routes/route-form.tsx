"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { routeService, type RouteDraft } from "@/services/route-service";
import type { Stop } from "@/types/stop";

import { RouteStopEditor } from "./route-stop-editor";

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function RouteForm({
  draft,
  stops,
  submitLabel,
  onSaved,
  manageStops = true,
}: {
  draft: RouteDraft;
  stops: readonly Stop[];
  submitLabel: string;
  onSaved: () => void;
  manageStops?: boolean;
}) {
  const [name, setName] = useState(draft.name);
  const [code, setCode] = useState(draft.code);
  const [description, setDescription] = useState(draft.description);
  const [duration, setDuration] = useState(String(draft.estimatedDurationMinutes));
  const [active, setActive] = useState(draft.active);
  const [stopIds, setStopIds] = useState(draft.stopIds);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function save() {
    setPending(true);
    setError(null);
    const result = routeService.saveRoute({
      id: draft.id,
      name,
      code,
      description,
      stopIds: manageStops ? stopIds : draft.stopIds,
      estimatedDurationMinutes: Number(duration),
      active,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.errors[0]?.message ?? "Unable to save this route.");
      return;
    }
    onSaved();
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">Route name</span>
        <input className={fieldClassName} value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">Route code</span>
        <input className={fieldClassName} value={code} onChange={(event) => setCode(event.target.value)} />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">Description</span>
        <textarea
          className="min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">Estimated duration (minutes)</span>
        <input
          className={fieldClassName}
          inputMode="numeric"
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Active for new bookings
      </label>
      {manageStops ? (
        <div>
          <p className="mb-2 text-sm font-medium">Stops in service order</p>
          <RouteStopEditor stopIds={stopIds} stops={stops} onChange={setStopIds} error={null} />
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving route..." : submitLabel}
      </Button>
    </form>
  );
}
