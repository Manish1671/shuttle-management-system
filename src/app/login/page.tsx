import type { Metadata } from "next";

import { UserPicker } from "@/features/auth/user-picker";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Choose a CampusRide demo account.",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-card sm:p-8">
        <p className="text-sm font-semibold tracking-wide text-primary">CampusRide</p>
        <p className="mt-1 text-sm text-muted-foreground">Smart Campus Transit</p>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
          Welcome to CampusRide
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choose a demo account to explore the shuttle management platform.
        </p>
        <UserPicker />
      </section>
    </main>
  );
}
