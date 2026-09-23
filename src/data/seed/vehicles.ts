import type { Vehicle } from "@/types/vehicle";

export const vehicles: Vehicle[] = [
  {
    id: "vehicle_01",
    registrationNumber: "PB65CR1001",
    displayName: "Campus Shuttle 01",
    capacity: 40,
    status: "active",
  },
  {
    id: "vehicle_02",
    registrationNumber: "PB65CR1002",
    displayName: "Campus Shuttle 02",
    capacity: 32,
    status: "active",
  },
  {
    id: "vehicle_03",
    registrationNumber: "PB65CR1003",
    displayName: "Campus Shuttle 03",
    capacity: 40,
    status: "active",
  },
  {
    id: "vehicle_04",
    registrationNumber: "PB65CR1004",
    displayName: "Campus Minibus 04",
    capacity: 20,
    status: "active",
  },
  {
    id: "vehicle_05",
    registrationNumber: "PB65CR1005",
    displayName: "Campus Shuttle 05",
    capacity: 40,
    status: "maintenance",
  },
  {
    id: "vehicle_06",
    registrationNumber: "PB65CR1006",
    displayName: "Campus Van 06",
    capacity: 12,
    status: "inactive",
  },
];
