"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { DemoUser } from "@/types/user";

import {
  CURRENT_USER_STORAGE_KEY,
  findDemoUser,
} from "./demo-users";

type CurrentUserContextValue = {
  user: DemoUser | null;
  isReady: boolean;
  selectUser: (user: DemoUser) => void;
  logout: () => void;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

const listeners = new Set<() => void>();

let storedUserId: string | null = null;
let hasReadStorage = false;

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readStoredUserId(): string | null {
  if (!hasReadStorage) {
    storedUserId = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    hasReadStorage = true;
  }

  return storedUserId;
}

function getServerUserId(): null {
  return null;
}

function subscribeToHydration() {
  return () => {};
}

function CurrentUserState({ children }: { children: ReactNode }) {
  const isReady = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const userId = useSyncExternalStore(
    subscribe,
    readStoredUserId,
    getServerUserId,
  );
  const user = isReady ? findDemoUser(userId) : null;

  const value = useMemo<CurrentUserContextValue>(
    () => ({
      user,
      isReady,
      selectUser(nextUser) {
        storedUserId = nextUser.id;
        hasReadStorage = true;
        window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, nextUser.id);
        emit();
      },
      logout() {
        storedUserId = null;
        hasReadStorage = true;
        window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        emit();
      },
    }),
    [user, isReady],
  );

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  return <CurrentUserState>{children}</CurrentUserState>;
}

export function useCurrentUser(): CurrentUserContextValue {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider.");
  }

  return context;
}
