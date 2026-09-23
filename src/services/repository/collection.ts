export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryError";
  }
}

type Identified = { id: string };

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Array-backed collection stored in localStorage.
 * Reads during server rendering return the seed and do not touch storage.
 * Writes require a browser.
 */
export function createCollection<T extends Identified>(
  storageKey: string,
  seed: readonly T[],
  ensureReady: () => void,
) {
  let cache: T[] | null = null;

  function read(): T[] {
    if (!canUseStorage()) {
      return seed.map((item) => structuredClone(item));
    }

    ensureReady();

    if (!cache) {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        cache = seed.map((item) => structuredClone(item));
        window.localStorage.setItem(storageKey, JSON.stringify(cache));
      } else {
        try {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            cache = parsed as T[];
          } else {
            cache = seed.map((item) => structuredClone(item));
            window.localStorage.setItem(storageKey, JSON.stringify(cache));
          }
        } catch {
          cache = seed.map((item) => structuredClone(item));
          window.localStorage.setItem(storageKey, JSON.stringify(cache));
        }
      }
    }

    return cache;
  }

  function write(items: T[]) {
    if (!canUseStorage()) {
      throw new RepositoryError("CampusRide data can only be saved in the browser.");
    }

    cache = items;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }

  return {
    getAll(): T[] {
      return read().map((item) => structuredClone(item));
    },

    getById(id: string): T | null {
      const found = read().find((item) => item.id === id);
      return found ? structuredClone(found) : null;
    },

    create(item: T): T {
      const items = read();
      if (items.some((existing) => existing.id === item.id)) {
        throw new RepositoryError(`A record with id ${item.id} already exists.`);
      }

      const next = structuredClone(item);
      write([...items, next]);
      return structuredClone(next);
    },

    update(id: string, patch: Partial<Omit<T, "id">>): T | null {
      const items = read();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        return null;
      }

      const current = items[index];
      if (!current) {
        return null;
      }

      const next = { ...current, ...patch, id };
      write(items.map((item, itemIndex) => (itemIndex === index ? next : item)));
      return structuredClone(next);
    },

    delete(id: string): boolean {
      const items = read();
      const next = items.filter((item) => item.id !== id);
      if (next.length === items.length) {
        return false;
      }

      write(next);
      return true;
    },
  };
}

export type CollectionRepository<T extends Identified> = ReturnType<
  typeof createCollection<T>
>;
