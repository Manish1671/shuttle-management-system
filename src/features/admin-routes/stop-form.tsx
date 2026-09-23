"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useWriteGuard } from "@/lib/use-write-guard";
import { stopService, type StopDraft } from "@/services/stop-service";

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function StopForm({ draft, onSaved }: { draft: StopDraft; onSaved: () => void }) {
  const [name, setName] = useState(draft.name);
  const [shortName, setShortName] = useState(draft.shortName);
  const [description, setDescription] = useState(draft.description);
  const [active, setActive] = useState(draft.active);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useWriteGuard();

  function save() {
    run(() => {
      setError(null);
      const result = stopService.saveStop({ id: draft.id, name, shortName, description, active });
      if (!result.ok) {
        setError(result.errors[0]?.message ?? "Unable to save this stop.");
        return;
      }
      onSaved();
    });
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
        <span className="mb-1.5 block font-medium">Stop name</span>
        <input className={fieldClassName} value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">Short code</span>
        <input className={fieldClassName} value={shortName} onChange={(event) => setShortName(event.target.value)} />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">Description</span>
        <textarea
          className="min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Active for new bookings
      </label>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving stop..." : draft.id ? "Save stop" : "Create stop"}
      </Button>
    </form>
  );
}
