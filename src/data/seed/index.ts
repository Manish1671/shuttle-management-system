import { bookings } from "./bookings";
import { drivers } from "./drivers";
import { driverSchedules } from "./schedules";
import { routes } from "./routes";
import { stops } from "./stops";
import { trips } from "./trips";
import { users } from "./users";
import { vehicles } from "./vehicles";
import { validateDataset, type CampusDataset } from "./integrity";

export const campusDataset: CampusDataset = {
  users,
  drivers,
  vehicles,
  stops,
  routes,
  trips,
  bookings,
  driverSchedules,
};

export const seedIntegrity = validateDataset(campusDataset);

export {
  bookings,
  drivers,
  driverSchedules,
  routes,
  stops,
  trips,
  users,
  vehicles,
};
