import type { DemoUser } from "@/types/user";

export const CURRENT_USER_STORAGE_KEY = "campusride.userId";

export const DEMO_USERS: readonly DemoUser[] = [
  {
    id: "STU2026001",
    name: "Aarav Sharma",
    role: "rider",
    riderType: "student",
  },
  {
    id: "EMP2026012",
    name: "Priya Mehta",
    role: "rider",
    riderType: "staff",
  },
  {
    id: "ADM001",
    name: "Transport Office",
    role: "admin",
  },
];

export function findDemoUser(id: string | null): DemoUser | null {
  if (!id) {
    return null;
  }

  return DEMO_USERS.find((user) => user.id === id) ?? null;
}

export function roleLabel(user: DemoUser): string {
  if (user.role === "admin") {
    return "Administrator";
  }

  if (user.riderType === "staff") {
    return "Staff";
  }

  return "Student";
}

export function homePathFor(user: DemoUser): "/dashboard" | "/admin" {
  return user.role === "admin" ? "/admin" : "/dashboard";
}

export function initials(name: string): string {
  const letters = name
    .split(" ")
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");

  return letters.join("") || "?";
}
