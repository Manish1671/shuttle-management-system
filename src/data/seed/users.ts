import { DEMO_USERS } from "@/features/auth/demo-users";
import type { User } from "@/types/user";

const demoContact: Record<string, { email: string; phone: string }> = {
  STU2026001: {
    email: "aarav.sharma@lpu.in",
    phone: "+91-98100-10001",
  },
  EMP2026012: {
    email: "priya.mehta@lpu.in",
    phone: "+91-98100-10012",
  },
  ADM001: {
    email: "transport.office@lpu.in",
    phone: "+91-1824-444001",
  },
};

const extraRiders: User[] = [
  {
    id: "STU2026018",
    name: "Kabir Nair",
    role: "rider",
    riderType: "student",
    email: "kabir.nair@lpu.in",
    phone: "+91-98100-20018",
  },
  {
    id: "STU2026044",
    name: "Ishita Rao",
    role: "rider",
    riderType: "student",
    email: "ishita.rao@lpu.in",
    phone: "+91-98100-20044",
  },
  {
    id: "STU2026072",
    name: "Rohan Das",
    role: "rider",
    riderType: "student",
    email: "rohan.das@lpu.in",
    phone: "+91-98100-20072",
  },
  {
    id: "EMP2026033",
    name: "Sneha Kapoor",
    role: "rider",
    riderType: "staff",
    email: "sneha.kapoor@lpu.in",
    phone: "+91-98100-30033",
  },
  {
    id: "STU2026088",
    name: "Anika Bose",
    role: "rider",
    riderType: "student",
    email: "anika.bose@lpu.in",
    phone: "+91-98100-20088",
  },
];

export const users: User[] = [
  ...DEMO_USERS.map((user) => {
    const contact = demoContact[user.id];
    return {
      ...user,
      email: contact?.email ?? `${user.id.toLowerCase()}@lpu.in`,
      phone: contact?.phone,
    };
  }),
  ...extraRiders,
];
