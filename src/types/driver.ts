export type DriverStatus = "available" | "on_trip" | "on_break" | "off_duty";

export type LicenseStatus = "valid" | "expiring";

export type Driver = {
  id: string;
  name: string;
  employeeId: string;
  phone: string;
  status: DriverStatus;
  licenseNumber: string;
  licenseStatus: LicenseStatus;
  assignedVehicleId?: string;
};
