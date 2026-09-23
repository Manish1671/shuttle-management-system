export type UserRole = "rider" | "admin";

export type RiderType = "student" | "staff";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  riderType?: RiderType;
  email: string;
  phone?: string;
};

/** Account shown on the demo sign-in screen. */
export type DemoUser = Pick<User, "id" | "name" | "role" | "riderType">;
