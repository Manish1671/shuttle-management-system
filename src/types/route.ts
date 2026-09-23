export type Route = {
  id: string;
  name: string;
  code: string;
  description: string;
  /** Ordered pickup and drop-off sequence. Earlier indexes are served first. */
  stopIds: string[];
  estimatedDurationMinutes: number;
  active: boolean;
};
