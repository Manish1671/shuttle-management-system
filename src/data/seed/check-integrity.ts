import { campusDataset, seedIntegrity } from "./index";

const counts = {
  users: campusDataset.users.length,
  drivers: campusDataset.drivers.length,
  vehicles: campusDataset.vehicles.length,
  stops: campusDataset.stops.length,
  routes: campusDataset.routes.length,
  trips: campusDataset.trips.length,
  bookings: campusDataset.bookings.length,
  driverSchedules: campusDataset.driverSchedules.length,
};

if (!seedIntegrity.valid) {
  for (const item of seedIntegrity.errors) {
    console.error(`${item.code}: ${item.message}`);
  }
  console.error(`Seed integrity failed with ${seedIntegrity.errors.length} error(s).`);
  process.exit(1);
}

console.log("Seed integrity passed.");
console.log(counts);
