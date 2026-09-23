import { todayDateString } from "@/lib/time";

import { rangeForPreset } from "./analytics-metrics";
import type { AnalyticsFilters, AnalyticsPreset } from "./analytics-types";

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AnalyticsFiltersBar({
  filters,
  bounds,
  routes,
  onChange,
}: {
  filters: AnalyticsFilters;
  bounds: { start: string; end: string } | null;
  routes: readonly { id: string; code: string; name: string }[];
  onChange: (filters: AnalyticsFilters) => void;
}) {
  function choosePreset(preset: AnalyticsPreset) {
    if (preset === "custom") {
      onChange({ ...filters, preset });
      return;
    }
    const range = rangeForPreset(preset, todayDateString(), bounds);
    onChange({ ...filters, preset, ...range });
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">Period</span>
        <select
          className={fieldClassName}
          value={filters.preset}
          onChange={(event) => choosePreset(event.target.value as AnalyticsPreset)}
        >
          <option value="today">Today</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="all">All available data</option>
          <option value="custom">Custom range</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">Start</span>
        <input
          className={fieldClassName}
          type="date"
          value={filters.start}
          onChange={(event) => onChange({ ...filters, preset: "custom", start: event.target.value })}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">End</span>
        <input
          className={fieldClassName}
          type="date"
          value={filters.end}
          onChange={(event) => onChange({ ...filters, preset: "custom", end: event.target.value })}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block font-medium">Route</span>
        <select
          className={fieldClassName}
          value={filters.routeId}
          onChange={(event) => onChange({ ...filters, routeId: event.target.value })}
        >
          <option value="all">All routes</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.code} · {route.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
