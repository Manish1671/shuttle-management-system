export type UserRole = "rider" | "admin";

export type RiderType = "student" | "staff";

export type DemoUser = {
  id: string;
  name: string;
  role: UserRole;
  riderType?: RiderType;
};
