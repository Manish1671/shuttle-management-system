import type { Trip, TripStatus } from "@/types/trip";

type TripSeed = [
  id: string,
  routeId: string,
  vehicleId: string,
  driverId: string,
  serviceDate: string,
  departureTime: string,
  arrivalTime: string,
  capacity: number,
  bookedSeats: number,
  status: TripStatus,
];

function trip(seed: TripSeed): Trip {
  const [
    id,
    routeId,
    vehicleId,
    driverId,
    serviceDate,
    departureTime,
    arrivalTime,
    capacity,
    bookedSeats,
    status,
  ] = seed;

  return {
    id,
    routeId,
    vehicleId,
    driverId,
    serviceDate,
    departureTime,
    arrivalTime,
    capacity,
    bookedSeats,
    status,
  };
}

export const trips: Trip[] = [
  trip(["trip_2201", "route_r01", "vehicle_01", "driver_rahul", "2026-09-22", "07:30", "07:55", 40, 3, "completed"]),
  trip(["trip_2202", "route_r02", "vehicle_02", "driver_neha", "2026-09-22", "08:00", "08:20", 32, 2, "completed"]),
  trip(["trip_2203", "route_r03", "vehicle_03", "driver_meera", "2026-09-22", "08:30", "09:00", 40, 2, "completed"]),
  trip(["trip_2204", "route_r04", "vehicle_04", "driver_vikram", "2026-09-22", "09:00", "09:18", 20, 2, "completed"]),
  trip(["trip_2205", "route_r05", "vehicle_01", "driver_sara", "2026-09-22", "10:00", "10:22", 40, 2, "completed"]),
  trip(["trip_2206", "route_r01", "vehicle_02", "driver_dev", "2026-09-22", "12:00", "12:25", 32, 1, "completed"]),
  trip(["trip_2207", "route_r06", "vehicle_03", "driver_ananya", "2026-09-22", "15:00", "15:24", 40, 1, "completed"]),
  trip(["trip_2208", "route_r03", "vehicle_04", "driver_arjun", "2026-09-22", "17:00", "17:30", 20, 1, "completed"]),

  trip(["trip_2301", "route_r01", "vehicle_01", "driver_rahul", "2026-09-23", "07:30", "07:55", 40, 5, "completed"]),
  trip(["trip_2302", "route_r02", "vehicle_02", "driver_neha", "2026-09-23", "08:00", "08:20", 32, 4, "completed"]),
  trip(["trip_2303", "route_r03", "vehicle_03", "driver_meera", "2026-09-23", "08:30", "09:00", 40, 3, "completed"]),
  trip(["trip_2304", "route_r01", "vehicle_04", "driver_vikram", "2026-09-23", "09:00", "09:25", 20, 3, "boarding"]),
  trip(["trip_2305", "route_r05", "vehicle_01", "driver_rahul", "2026-09-23", "10:00", "10:22", 40, 2, "in_progress"]),
  trip(["trip_2306", "route_r04", "vehicle_02", "driver_sara", "2026-09-23", "11:00", "11:18", 32, 2, "scheduled"]),
  trip(["trip_2307", "route_r06", "vehicle_03", "driver_ananya", "2026-09-23", "11:30", "11:54", 40, 0, "cancelled"]),
  trip(["trip_2308", "route_r02", "vehicle_04", "driver_meera", "2026-09-23", "12:00", "12:20", 20, 2, "scheduled"]),
  trip(["trip_2309", "route_r03", "vehicle_01", "driver_dev", "2026-09-23", "13:00", "13:30", 40, 1, "scheduled"]),
  trip(["trip_2310", "route_r01", "vehicle_02", "driver_ananya", "2026-09-23", "14:00", "14:25", 32, 1, "scheduled"]),
  trip(["trip_2311", "route_r04", "vehicle_03", "driver_vikram", "2026-09-23", "15:00", "15:18", 40, 1, "scheduled"]),
  trip(["trip_2312", "route_r05", "vehicle_04", "driver_neha", "2026-09-23", "16:00", "16:22", 20, 1, "scheduled"]),
  trip(["trip_2313", "route_r06", "vehicle_01", "driver_meera", "2026-09-23", "17:00", "17:24", 40, 1, "scheduled"]),

  trip(["trip_2401", "route_r01", "vehicle_01", "driver_rahul", "2026-09-24", "07:30", "07:55", 40, 3, "scheduled"]),
  trip(["trip_2402", "route_r02", "vehicle_02", "driver_neha", "2026-09-24", "08:00", "08:20", 32, 2, "scheduled"]),
  trip(["trip_2403", "route_r03", "vehicle_03", "driver_meera", "2026-09-24", "08:30", "09:00", 40, 2, "scheduled"]),
  trip(["trip_2404", "route_r01", "vehicle_04", "driver_vikram", "2026-09-24", "09:00", "09:25", 20, 2, "scheduled"]),
  trip(["trip_2405", "route_r05", "vehicle_01", "driver_sara", "2026-09-24", "10:00", "10:22", 40, 1, "scheduled"]),
  trip(["trip_2406", "route_r04", "vehicle_02", "driver_arjun", "2026-09-24", "11:00", "11:18", 32, 1, "scheduled"]),
  trip(["trip_2407", "route_r06", "vehicle_03", "driver_dev", "2026-09-24", "14:00", "14:24", 40, 1, "scheduled"]),
  trip(["trip_2408", "route_r03", "vehicle_04", "driver_ananya", "2026-09-24", "16:00", "16:30", 20, 1, "scheduled"]),
];
