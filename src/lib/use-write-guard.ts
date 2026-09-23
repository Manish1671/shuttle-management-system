"use client";

import { useRef, useState } from "react";

/** Blocks a second write until the current synchronous save finishes. */
export function useWriteGuard() {
  const locked = useRef(false);
  const [pending, setPending] = useState(false);

  function run(action: () => void) {
    if (locked.current) {
      return;
    }

    locked.current = true;
    setPending(true);
    try {
      action();
    } finally {
      locked.current = false;
      setPending(false);
    }
  }

  return { pending, run };
}
