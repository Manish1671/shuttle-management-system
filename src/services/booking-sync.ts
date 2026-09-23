const listeners = new Set<() => void>();

let changes = 0;

export function subscribeBookingChanges(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Server render stays at 0. The browser snapshot is always at least 1. */
export function getBookingRevision(): number {
  return changes + 1;
}

export function getServerBookingRevision(): number {
  return 0;
}

export function notifyBookingsChanged() {
  changes += 1;
  for (const listener of listeners) {
    listener();
  }
}
