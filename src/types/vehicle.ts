export type VehicleStatus = "active" | "maintenance" | "inactive";

export type Vehicle = {
  id: string;
  registrationNumber: string;
  displayName: string;
  capacity: number;
  status: VehicleStatus;
};
