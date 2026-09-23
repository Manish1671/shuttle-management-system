export type AnalyticsPreset = "today" | "7" | "30" | "all" | "custom";

export type AnalyticsFilters = {
  preset: AnalyticsPreset;
  start: string;
  end: string;
  routeId: string;
};
