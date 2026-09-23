import { bookings } from "@/data/seed/bookings";
import { drivers } from "@/data/seed/drivers";
import { driverSchedules } from "@/data/seed/schedules";
import { routes } from "@/data/seed/routes";
import { stops } from "@/data/seed/stops";
import { trips } from "@/data/seed/trips";
import { users } from "@/data/seed/users";
import { vehicles } from "@/data/seed/vehicles";
import type { Booking } from "@/types/booking";
import type { Driver } from "@/types/driver";
import type { DriverSchedule } from "@/types/schedule";
import type { Route } from "@/types/route";
import type { Stop } from "@/types/stop";
import type { Trip } from "@/types/trip";
import type { User } from "@/types/user";
import type { Vehicle } from "@/types/vehicle";

import { createCollection } from "./collection";

export const STORAGE_KEYS = {
  schemaVersion: "campusride:schema-version",
  users: "campusride:users",
  drivers: "campusride:drivers",
  vehicles: "campusride:vehicles",
  stops: "campusride:stops",
  routes: "campusride:routes",
  trips: "campusride:trips",
  bookings: "campusride:bookings",
  driverSchedules: "campusride:driver-schedules",
} as const;

/** Bump this when the seed shape changes so the browser reseeds. */
export const SCHEMA_VERSION = "1";

let seeded = false;

function ensureSeeded() {
  if (typeof window === "undefined" || seeded) {
    return;
  }

  if (window.localStorage.getItem(STORAGE_KEYS.schemaVersion) !== SCHEMA_VERSION) {
    window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    window.localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(drivers));
    window.localStorage.setItem(STORAGE_KEYS.vehicles, JSON.stringify(vehicles));
    window.localStorage.setItem(STORAGE_KEYS.stops, JSON.stringify(stops));
    window.localStorage.setItem(STORAGE_KEYS.routes, JSON.stringify(routes));
    window.localStorage.setItem(STORAGE_KEYS.trips, JSON.stringify(trips));
    window.localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
    window.localStorage.setItem(
      STORAGE_KEYS.driverSchedules,
      JSON.stringify(driverSchedules),
    );
    window.localStorage.setItem(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
  }

  seeded = true;
}

export const userRepository = createCollection<User>(
  STORAGE_KEYS.users,
  users,
  ensureSeeded,
);
export const driverRepository = createCollection<Driver>(
  STORAGE_KEYS.drivers,
  drivers,
  ensureSeeded,
);
export const vehicleRepository = createCollection<Vehicle>(
  STORAGE_KEYS.vehicles,
  vehicles,
  ensureSeeded,
);
export const stopRepository = createCollection<Stop>(
  STORAGE_KEYS.stops,
  stops,
  ensureSeeded,
);
export const routeRepository = createCollection<Route>(
  STORAGE_KEYS.routes,
  routes,
  ensureSeeded,
);
export const tripRepository = createCollection<Trip>(
  STORAGE_KEYS.trips,
  trips,
  ensureSeeded,
);
export const bookingRepository = createCollection<Booking>(
  STORAGE_KEYS.bookings,
  bookings,
  ensureSeeded,
);
export const scheduleRepository = createCollection<DriverSchedule>(
  STORAGE_KEYS.driverSchedules,
  driverSchedules,
  ensureSeeded,
);
