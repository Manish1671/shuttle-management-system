import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to CampusRide. Authentication is not available yet.",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-card">
        <p className="text-sm font-medium tracking-wide text-primary">
          CampusRide
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-card-foreground">
          Smart Campus Transit
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Authentication will be implemented in the next milestone.
        </p>
      </section>
    </main>
  );
}
