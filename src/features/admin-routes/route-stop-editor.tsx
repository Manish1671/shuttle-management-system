import { Button } from "@/components/ui/button";
import type { Stop } from "@/types/stop";

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function RouteStopEditor({
  stopIds,
  stops,
  onChange,
  error,
}: {
  stopIds: string[];
  stops: readonly Stop[];
  onChange: (stopIds: string[]) => void;
  error: string | null;
}) {
  const byId = new Map(stops.map((stop) => [stop.id, stop]));
  const available = stops.filter((stop) => !stopIds.includes(stop.id));

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= stopIds.length) {
      return;
    }
    const next = [...stopIds];
    const current = next[index];
    const swap = next[target];
    if (!current || !swap) {
      return;
    }
    next[index] = swap;
    next[target] = current;
    onChange(next);
  }

  return (
    <div>
      {stopIds.length === 0 ? (
        <p className="text-sm text-muted-foreground">This route has no stops configured.</p>
      ) : (
        <ol className="grid gap-2">
          {stopIds.map((stopId, index) => {
            const stop = byId.get(stopId);
            return (
              <li key={`${stopId}-${index}`} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <span className="w-6 text-sm font-medium text-muted-foreground">{index + 1}</span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{stop?.name ?? "Unknown stop"}</span>
                  {stop && !stop.active ? (
                    <span className="ml-2 text-xs text-muted-foreground">Inactive</span>
                  ) : null}
                </span>
                <Button type="button" variant="outline" size="sm" disabled={index === 0} onClick={() => move(index, -1)}>
                  Move up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index === stopIds.length - 1}
                  onClick={() => move(index, 1)}
                >
                  Move down
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange(stopIds.filter((id) => id !== stopId))}
                >
                  Remove
                </Button>
              </li>
            );
          })}
        </ol>
      )}
      <label className="mt-3 block text-sm">
        <span className="mb-1.5 block font-medium">Add an existing stop</span>
        <select
          className={fieldClassName}
          defaultValue=""
          onChange={(event) => {
            const stopId = event.target.value;
            if (!stopId) {
              return;
            }
            onChange([...stopIds, stopId]);
            event.target.value = "";
          }}
        >
          <option value="">Choose a stop</option>
          {available.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.name}
              {stop.active ? "" : " (inactive)"}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
