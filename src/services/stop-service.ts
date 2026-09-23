import type { ValidationError } from "@/lib/validation/result";
import { notifyBookingsChanged } from "@/services/booking-sync";
import { RepositoryError } from "@/services/repository/collection";
import type { Stop } from "@/types/stop";

import { stopRepository } from "./repository";

export type StopDraft = {
  id?: string;
  name: string;
  shortName: string;
  description: string;
  active: boolean;
};

export type StopWriteResult =
  | { ok: true; stop: Stop }
  | { ok: false; errors: ValidationError[] };

function failure(code: string, message: string): StopWriteResult {
  return { ok: false, errors: [{ code, message }] };
}

function slug(value: string): string {
  const next = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return next || "stop";
}

function nextStopId(shortName: string): string {
  const base = `stop_${slug(shortName)}`;
  if (!stopRepository.getById(base)) {
    return base;
  }
  let index = 2;
  while (stopRepository.getById(`${base}_${index}`)) {
    index += 1;
  }
  return `${base}_${index}`;
}

export const stopService = {
  getAll(): Stop[] {
    return stopRepository.getAll();
  },
  getById(id: string): Stop | null {
    return stopRepository.getById(id);
  },
  create(stop: Stop): Stop {
    return stopRepository.create(stop);
  },
  update(id: string, patch: Partial<Omit<Stop, "id">>): Stop | null {
    return stopRepository.update(id, patch);
  },
  delete(id: string): boolean {
    return stopRepository.delete(id);
  },

  saveStop(draft: StopDraft): StopWriteResult {
    const name = draft.name.trim();
    const shortName = draft.shortName.trim();
    const description = draft.description.trim();
    if (!name) {
      return failure("STOP_NAME", "Enter a stop name.");
    }
    if (!shortName) {
      return failure("STOP_CODE", "Enter a short code for this stop.");
    }

    const stops = stopRepository.getAll();
    const duplicate = stops.some(
      (stop) => stop.id !== draft.id && stop.shortName.toLowerCase() === shortName.toLowerCase(),
    );
    if (duplicate) {
      return failure("DUPLICATE_CODE", "A stop with this code already exists.");
    }
    if (draft.id && !stopRepository.getById(draft.id)) {
      return failure("STOP_NOT_FOUND", "This stop could not be found.");
    }

    const stop: Stop = {
      id: draft.id ?? nextStopId(shortName),
      name,
      shortName,
      description,
      active: draft.active,
    };

    try {
      const saved = draft.id
        ? stopRepository.update(stop.id, {
            name: stop.name,
            shortName: stop.shortName,
            description: stop.description,
            active: stop.active,
          })
        : stopRepository.create(stop);
      if (!saved) {
        return failure("REPOSITORY_FAILURE", "Unable to save this stop. Please try again.");
      }
      notifyBookingsChanged();
      return { ok: true, stop: saved };
    } catch (error) {
      if (error instanceof RepositoryError) {
        return failure("REPOSITORY_FAILURE", "Unable to save this stop. Please try again.");
      }
      throw error;
    }
  },
};
